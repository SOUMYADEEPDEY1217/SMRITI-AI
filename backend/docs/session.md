# SESSION.md

## Session 4 — 2026-09-10
**Focus:** Add Ollama back as a local fallback behind Gemini (user now has Ollama installed) + Firebase project setup walkthrough.

### Done
- `vision_service.py` updated: Gemini stays PRIMARY (unchanged reasoning —
  best quality, no local GPU needed day-to-day). Ollama/llava is now a
  FALLBACK, only called if Gemini fails/times out/rate-limits. Verified
  with a targeted test: Gemini failure correctly triggers an Ollama
  attempt, and when neither is reachable it falls through cleanly to the
  safe default hypothesis (never crashes the endpoint).
- Re-ran the full `smoke_test.py` suite after the change — all 9 scenarios
  still pass, confirming the fallback logic didn't break anything else.
- `config.py`, `.env.example`, `requirements.txt` updated: `GEMINI_API_KEY`
  required, `OLLAMA_URL`/`OLLAMA_MODEL` optional (sane defaults), `httpx`
  dependency restored for the Ollama HTTP calls.
- Walked through real Firebase project setup with the user: identified
  the correct project (`neuraura-252b9`, Spark/free plan), confirmed
  Firestore is enabled and empty (expected — collections auto-create on
  first write), located the service account JSON, flagged that two keys
  had been generated (only one is needed — recommended revoking the
  unused one), and where `FIREBASE_PROJECT_ID` actually comes from (the
  service account email: `...@neuraura-252b9.iam.gserviceaccount.com`).

### Reminder for the user
- Move the kept service account JSON to `secrets/firebase-service-account.json`
  and add `secrets/` + `.env` to `.gitignore` before any `git add .` —
  this file is a full admin credential.
- If demoing with the Ollama fallback as a real safety net, run
  `ollama pull llava` and start Ollama *before* the demo so it's warmed
  up — a cold first request will be slow and could still time out.

## Session 3 — 2026-09-10
**Focus:** Reverted to Gemini-only vision (no compute for local inference) + actually verified the whole thing boots and runs correctly instead of just reviewing it.

### Done
- `vision_service.py` rewritten: Ollama/local path removed entirely,
  Gemini 2.5 Flash is now the only vision path. `GEMINI_API_KEY` is
  required in `config.py` (was optional). Documented the honest tradeoff:
  photo analysis now needs internet; reminders/quiz/browsing don't.
- Confirmed InsightFace is genuinely implemented in `face_service.py`
  (not a stub) — flagged that `buffalo_l` is the heavier InsightFace
  model and suggested `buffalo_s` given the same compute constraint that
  ruled out local vision.
- **Actually ran the code**, not just reviewed it: `smoke_test.py` mocks
  every external dependency (Firebase, Cloudinary, Gemini, InsightFace)
  and drives the real `app.main` FastAPI app through 9 scenarios via
  `TestClient` — auth required, IDOR blocked (cross-user reminder read/
  edit), memory save ignores client-spoofed `photo_url`, replay-after-save
  blocked (single-use provenance token), self-grading exploit blocked,
  quiz replay blocked, invalid `difficulty` rejected (422), bad
  content-type rejected (400), security headers present on every
  response. **All 9 passed against the actual code.**
- Trimmed `httpx` from requirements (was only needed for the removed
  Ollama HTTP calls), added `pytest` for `smoke_test.py`.
- Updated `.env.example`, `techstack.md`, `architecture.md` to match.

### Verified-working checklist
- [x] App boots (`app.main:app` imports and starts cleanly)
- [x] Auth: missing/invalid token → 401
- [x] Ownership: cross-user reads return empty, cross-user writes return 404/403
- [x] Memory save: server-side `photo_url` wins over client-supplied one
- [x] Memory save: replay with a consumed `memory_id` → 403
- [x] Quiz: correct_answer never trusted from client, graded server-side
- [x] Quiz: submitted question can't be resubmitted
- [x] Input validation: bad file type → 400, bad difficulty → 422
- [x] Security headers present on all responses
- [ ] NOT verified: real Firebase/Cloudinary/Gemini calls (needs real
      credentials — mocked in this test by necessity). Run once against
      real credentials before demo day to catch anything the mocks can't.

## Session 2 — 2026-09-10
**Focus:** Full security hardening pass + fill in every missing piece so the project actually boots and runs end to end.

### Done
- Built the previously-missing core infra that nothing could run without:
  `app/config.py` (env-only settings, fails fast if misconfigured),
  `app/services/firebase_service.py` (Firestore CRUD + token verification,
  capped query results, added `delete_document`), `app/services/face_service.py`
  (InsightFace wrapper — never existed before, built with Pillow decode +
  dimension guard + similarity threshold), `app/limiter.py` + `app/main.py`
  (CORS allowlist, global + per-route rate limiting, security headers,
  catch-all exception handler, health check, router wiring).
- Added rate limiting to every AI/upload-triggering endpoint (`/enroll`,
  `/recognize`, `/analyze`, `/generate`, `/generate-sequence`, `/submit`,
  reminder creation) — closes the cost-DoS gap from unlimited AI/storage calls.
- Constrained `difficulty` to a `Literal["easy","medium","hard"]` in
  `quiz.py` (was an unvalidated free string).
- Clamped `limit` in `/generate-sequence` to 2–20 (was unbounded).
- `save_memory` now deletes its `pending_memories` record after use —
  makes the provenance token single-use instead of indefinitely reusable.
- `face_service.get_face_embeddings` decodes every image through Pillow
  first, verifies it's a real image, and rejects anything over 4096px on
  either side — closes a decompression-bomb vector that a compressed-size
  check alone can't catch.
- `match_face` now enforces a hard similarity floor (0.55) — a weak match
  is never surfaced as a suggestion.
- Added `requirements.txt` and `.env.example` so the whole stack is
  reproducible without guessing dependency versions or env var names.

### Vulnerability summary (all closed as of this session)
| Vulnerability | Status |
|---|---|
| Unbounded file upload / no content-type check | ✅ fixed (prior session) |
| IDOR on memory save | ✅ fixed (prior session) |
| Self-gradable / replayable quiz submissions | ✅ fixed (prior session) |
| Offline/local AI requirement violated | ✅ fixed (prior session) |
| No rate limiting (cost-DoS) | ✅ fixed this session |
| No CORS allowlist | ✅ fixed this session |
| No decompression-bomb guard on images | ✅ fixed this session |
| Unvalidated `difficulty` / unbounded `limit` params | ✅ fixed this session |
| Reusable `pending_memories` provenance token | ✅ fixed this session |
| Stack traces leaking on unhandled errors | ✅ fixed this session |
| Missing security response headers | ✅ fixed this session |
| Hardcoded/implicit secrets | ✅ fixed this session (env-only, fail-fast) |

### Still open (non-security, functional gaps — see workflow.md)
1. New game type reusing existing memory data — not built.
2. Read-only caregiver dashboard — not built, needs a `caregiver_links` collection.
3. `pending_memories` records still have no TTL — a stale unused one just
   sits there forever (not exploitable, just a cleanup nicety).

## Session 1 — 2026-09-09
**Focus:** Security review consolidation + Priority #1 (reminders) + Priority #2 (vision offline fix)

### Done
- Reviewed all provided routers/services. Confirmed the "(1)" versions of
  `memories.py`, `family_members.py`, `quiz.py` already contain the fixes
  for: unbounded file upload (DoS), missing content-type validation, IDOR
  on memory save, self-gradable quiz submissions, replayable quiz
  submissions, unsorted rolling-accuracy window. **Use the "(1)" versions
  going forward, not the originals.**
- Fixed `vision_service.py`: was calling Gemini cloud API unconditionally,
  directly contradicting the offline/local requirement. Now Ollama/llava
  is primary (fully offline), Gemini is an explicit opt-in fallback gated
  by `settings.USE_CLOUD_FALLBACK`.
- Built `app/routers/reminders.py` from scratch: create/list/upcoming/
  update/complete(with recurrence)/delete, all ownership-scoped like the
  rest of the fixed routers.
- Created `dna.md`, `architecture.md`, `techstack.md`, `workflow.md` to
  track the project going forward.

### Open items for next session (in priority order)
1. Confirm `firebase_service.delete_document` exists (reminders DELETE
   depends on it) — add if missing.
2. Add `OLLAMA_URL`, `OLLAMA_MODEL`, `USE_CLOUD_FALLBACK` to
   `app/config.py`; add `httpx` to requirements if not already present.
3. Wire `reminders.router` into `main.py`.
4. Build a new game type reusing `objects[]`/`people[]` across memories
   (pattern/attention task) — no new AI calls needed, pure data reuse.
5. Build read-only caregiver dashboard endpoint — needs a
   `caregiver_links` collection first (doesn't exist yet).
6. Get `face_service.py` reviewed — never provided, unverified security/logic.

### Notes for continuity
- Working preference: fast output, code over discussion, honest flagging
  of real issues, minimal back-and-forth. Keep following that pattern.
- Don't reintroduce the plain `memories.py`/`family_members.py`/`quiz.py`
  (non-"(1)") versions — they're the pre-fix originals.
