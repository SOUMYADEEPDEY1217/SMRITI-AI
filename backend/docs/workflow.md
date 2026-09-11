# WORKFLOW.md

## The core recall loop (Steps 1-10)
1. Family enrolls a member's face (3-5 photos → averaged embedding).
2. Family uploads a memory photo.
3. Photo → Cloudinary.
4. Vision hypothesis generated (Ollama local, Gemini fallback).
5. Faces detected + matched against enrolled family members → suggestions.
6. Family reviews hypothesis + face suggestions in UI.
7. Family confirms/corrects → `POST /api/memories/` saves VERIFIED memory.
8. Verified memory → quiz questions (`quiz_service.generate_questions`).
9. User answers → graded server-side → `quiz_attempts` recorded.
10. Rolling accuracy → adaptive difficulty; weak memories resurface later
    (spaced recall via `/api/quiz/weak-memories`).

Reminders (new) sit alongside this loop as the re-engagement mechanism —
nudging the user to take meds, attend appointments, or come back and do a
quiz — independent of any single memory.

## Priority queue (status as of this session)
1. ✅ **Reminders router** — built (`app/routers/reminders.py`). Full CRUD,
   recurrence (daily/weekly/monthly), `/upcoming` feed, ownership-scoped.
   **Still needed**: confirm `firebase_service.delete_document` exists;
   wire the router into `main.py`; add `OLLAMA_*`/`USE_CLOUD_FALLBACK` to
   `app/config.py` (see techstack.md).
2. ✅ **Vision service cloud/local contradiction** — resolved. Ollama/llava
   is now primary, Gemini is opt-in fallback only.
3. ✅ **`generate_sequence_question` wired** — already done in the reviewed
   `quiz (1).py` / `memories (1).py` pair via `/api/quiz/generate-sequence`,
   with server-side `correct_order` storage (same anti-spoofing pattern as
   `/generate`).
4. ⏳ **New game type reusing existing memory data** — not yet built.
   Suggested next: a "pattern/attention" round using `objects[]` across a
   user's verified memories (e.g. "which object appeared in more than one
   memory?") — reuses data already collected, no new AI calls needed.
5. ⏳ **Read-only caregiver dashboard** — not yet built. Suggested shape:
   `GET /api/dashboard/summary` returning recent quiz_attempts accuracy,
   upcoming reminders, and weak memories for a given user_id, restricted to
   accounts explicitly linked as that user's caregiver (needs a
   `caregiver_links` collection — doesn't exist yet, flag before building).

## Session log
See `session.md` for a running log of what was done in each work session.
