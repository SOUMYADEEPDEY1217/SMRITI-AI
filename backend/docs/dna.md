# DNA.md — AI Cognitive Care Platform

## Mission
Help people with cognitive decline (dementia, early Alzheimer's, general memory
support) stay connected to their own life story, using their real family
photos and memories as the material — not generic trivia.

## Non-negotiables (violate these and the product is broken, not just imperfect)

1. **Offline/local-first AI.** The target user may have poor or no
   connectivity. Vision analysis must work with a local model
   (Ollama/llava) as the primary path. Cloud AI (Gemini) is an optional
   fallback only, never the only path.
2. **Human-in-the-loop, always.** AI never writes a final fact about a
   person's life unsupervised. Face matches, scene hypotheses, and
   activity guesses are *suggestions* a family member confirms or
   corrects before anything is saved as ground truth.
3. **Ownership is sacred.** One user's memories, family members, quiz
   results, and reminders must never be readable or writable by another
   account. Every read/write is scoped by uid and ownership-checked
   server-side — never trust a client-supplied ID alone.
4. **Grading integrity.** Quiz correctness is graded against server-stored
   answers, never a client-supplied "correct_answer". A question can't be
   replayed after it's been answered once.
5. **Fail gracefully, never hang a demo.** Every AI call has a timeout and
   a fallback hypothesis. A broken model call degrades the experience; it
   never crashes the flow.

## Who this is for
- Primary user: the person experiencing memory decline.
- Secondary users: family members / caregivers who enroll faces, verify
  memories, and (eventually) monitor via a dashboard.

## What "done" looks like for the hackathon demo
A caregiver uploads a few family photos, enrolls faces, the app proposes a
memory hypothesis fully offline, the family verifies it, and the elder user
plays a quiz/game built from that verified memory — with a reminder nudging
them to do it.
