# ARCHITECTURE.md

## High-level flow
```
Photo upload
   -> Cloudinary (storage)
   -> [parallel] vision_service (Ollama local, Gemini cloud fallback)
   -> [parallel] face_service (InsightFace) matched against family_members
   -> combined "hypothesis" returned to client (NOT saved yet)
   -> family confirms/corrects in UI
   -> POST /api/memories/ saves the VERIFIED memory
   -> quiz_service turns verified memory into quiz questions
   -> quiz.py persists correct answers server-side, grades on submit
   -> quiz_attempts feed adaptive difficulty + weak-memory resurfacing
   -> reminders nudge the user back into the app (medication, quiz time, etc.)
```

## Routers (`app/routers/`)
| Router | Status | Notes |
|---|---|---|
| `auth_dependency.py` | ✅ solid | Firebase bearer-token verification, reused everywhere |
| `family_members.py` | ✅ fixed | file-count/type/size validation added |
| `memories.py` | ✅ fixed | IDOR fixed via `pending_memories` provenance check; content-type/size validated |
| `quiz.py` | ✅ fixed | ownership check on `generate`, server-side answer storage, single-use grading |
| `reminders.py` | 🆕 built this session | full CRUD + recurrence + upcoming feed, ownership-scoped |
| caregiver dashboard | ❌ not built | see gaps below |

## Services (`app/services/`)
| Service | Status | Notes |
|---|---|---|
| `firebase_service.py` | assumed stable | Firestore CRUD wrapper (add/get/query/update; **needs `delete_document`** for reminders DELETE) |
| `cloudinary_service.py` | ✅ solid | swap from Firebase Storage to avoid Blaze plan requirement |
| `face_service.py` | assumed stable | InsightFace embeddings + matching (not reviewed this session, no file provided) |
| `quiz_service.py` | ✅ solid | pure templating, no ML; `generate_sequence_question` now wired |
| `vision_service.py` | ✅ Gemini-only (reverted from local) | no GPU available for local inference; requires internet, has timeout + safe fallback |

## Full file tree (after hardening pass)
```
app/
  main.py               # CORS, rate limiting, security headers, exception handler, router wiring
  config.py             # env-only settings, fails fast if misconfigured
  limiter.py            # shared slowapi Limiter (avoids circular import with main.py)
  routers/
    family_members.py   # enroll / list / recognize — rate-limited, validated uploads
    memories.py          # analyze / save / list — IDOR-safe, single-use provenance token
    quiz.py              # generate / generate-sequence / submit / weak-memories — ownership + anti-replay
    reminders.py         # full CRUD + recurrence — ownership-scoped
  services/
    auth_dependency.py   # Firebase bearer-token verification
    firebase_service.py  # Firestore CRUD wrapper, capped queries
    cloudinary_service.py# photo storage
    face_service.py      # InsightFace embeddings/matching, image-bomb guarded
    vision_service.py    # Ollama local primary, Gemini optional fallback
    quiz_service.py       # pure templating, no ML
requirements.txt
.env.example
docs/
  dna.md
  architecture.md
  techstack.md
  workflow.md
  session.md
```

## Security model (applied consistently after this session)
- **AuthN**: Firebase ID token via `Authorization: Bearer <token>`, verified per-request.
- **AuthZ**: every document read/write checks `doc.user_id == user["uid"]`.
- **Upload hardening**: content-type allowlist (jpeg/png/webp) + 10MB cap on
  every file-accepting endpoint, empty-file rejection.
- **IDOR closed** on memory save via `pending_memories` provenance record —
  a memory_id can only be saved by the same user who ran `/analyze` on it.
- **Self-grading exploit closed**: quiz answers never trusted from the
  client; server persists `correct_answer` keyed by `question_id`,
  single-use enforcement prevents replay after seeing feedback.

## Known gaps (see workflow.md priority order)
1. Caregiver dashboard endpoint (read-only aggregate view) — not built yet.
2. Games engine has no non-quiz mechanics (pattern recognition, attention
   tasks) — spec names these but only quiz-style MCQ/free-text exist.
3. Photo analysis (`/api/memories/analyze`) now hard-depends on internet
   connectivity for the Gemini call — no offline vision path exists in
   this build. Be explicit about this scope in any "offline support" claim.
4. `buffalo_l` InsightFace model is heavier than needed given compute
   constraints — consider `buffalo_s` if enrollment/recognition is slow
   on demo hardware.
