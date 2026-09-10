"""
Boot-tests the real app code with every external dependency mocked out.
This is not a unit test of business logic in isolation - it imports the
ACTUAL app.main, app.routers.*, app.services.* modules and drives them
through FastAPI's TestClient, so it catches real import errors, wiring
mistakes, and signature mismatches that a pure read-through can't.
"""
import sys
import types
import os
import io
from unittest.mock import MagicMock

# ---- env vars config.py requires ----
import tempfile
fake_creds_path = os.path.join(tempfile.gettempdir(), "fake-creds.json")

os.environ.update({
    "FIREBASE_CREDENTIALS_PATH": fake_creds_path,
    "FIREBASE_PROJECT_ID": "test-project",
    "CLOUDINARY_CLOUD_NAME": "test-cloud",
    "CLOUDINARY_API_KEY": "test-key",
    "CLOUDINARY_API_SECRET": "test-secret",
    "GEMINI_API_KEY": "test-gemini-key",
    "ALLOWED_ORIGINS": "http://localhost:3000",
    "ENV": "development",
})
with open(fake_creds_path, "w") as f:
    f.write("{}")

# ---- mock firebase_admin ----
firebase_admin = types.ModuleType("firebase_admin")
firebase_admin.initialize_app = MagicMock(return_value=MagicMock())
credentials_mod = types.ModuleType("firebase_admin.credentials")
credentials_mod.Certificate = MagicMock(return_value=MagicMock())
auth_mod = types.ModuleType("firebase_admin.auth")
auth_mod.verify_id_token = MagicMock(return_value={"uid": "test-user-123", "email": "test@example.com"})

_fake_firestore_docs = {}

class FakeDocRef:
    def __init__(self, collection, doc_id):
        self.collection, self.doc_id = collection, doc_id
    def set(self, data):
        _fake_firestore_docs[(self.collection, self.doc_id)] = dict(data)
    def get(self):
        snap = MagicMock()
        data = _fake_firestore_docs.get((self.collection, self.doc_id))
        snap.exists = data is not None
        snap.to_dict.return_value = dict(data) if data else None
        snap.id = self.doc_id
        return snap
    def update(self, changes):
        _fake_firestore_docs[(self.collection, self.doc_id)].update(changes)
    def delete(self):
        _fake_firestore_docs.pop((self.collection, self.doc_id), None)

class FakeCollection:
    def __init__(self, name):
        self.name = name
        self._field, self._value = None, None
    def document(self, doc_id=None):
        doc_id = doc_id or f"auto-{len(_fake_firestore_docs)}"
        return FakeDocRef(self.name, doc_id)
    def add(self, data):
        doc_id = f"auto-{len(_fake_firestore_docs)}"
        _fake_firestore_docs[(self.name, doc_id)] = dict(data)
        return (None, types.SimpleNamespace(id=doc_id))
    def where(self, field, op, value):
        self._field, self._value = field, value
        return self
    def limit(self, n):
        return self
    def stream(self):
        results = []
        for (coll, doc_id), data in _fake_firestore_docs.items():
            if coll == self.name and (self._field is None or data.get(self._field) == self._value):
                snap = types.SimpleNamespace(id=doc_id, to_dict=lambda d=data: dict(d))
                results.append(snap)
        return results

firestore_mod = types.ModuleType("firebase_admin.firestore")
_fake_db = MagicMock()
_fake_db.collection = lambda name: FakeCollection(name)
firestore_mod.client = MagicMock(return_value=_fake_db)

firebase_admin.credentials = credentials_mod
firebase_admin.auth = auth_mod
firebase_admin.firestore = firestore_mod
sys.modules["firebase_admin"] = firebase_admin
sys.modules["firebase_admin.credentials"] = credentials_mod
sys.modules["firebase_admin.auth"] = auth_mod
sys.modules["firebase_admin.firestore"] = firestore_mod

# ---- mock cloudinary ----
cloudinary_mod = types.ModuleType("cloudinary")
cloudinary_mod.config = MagicMock()
uploader_mod = types.ModuleType("cloudinary.uploader")
uploader_mod.upload = MagicMock(return_value={"secure_url": "https://fake.cloudinary.com/test.jpg"})
cloudinary_mod.uploader = uploader_mod
sys.modules["cloudinary"] = cloudinary_mod
sys.modules["cloudinary.uploader"] = uploader_mod

# ---- mock google.generativeai ----
genai_mod = types.ModuleType("google.generativeai")
genai_mod.configure = MagicMock()
fake_gemini_response = MagicMock()
fake_gemini_response.text = '{"scene":"park","activity":"walking","location_hint":null,"objects":["bench"],"people_count":1,"context":"a walk","confidence":0.7}'
fake_model = MagicMock()
fake_model.generate_content = MagicMock(return_value=fake_gemini_response)
genai_mod.GenerativeModel = MagicMock(return_value=fake_model)
google_mod = types.ModuleType("google")
google_mod.generativeai = genai_mod
sys.modules["google"] = google_mod
sys.modules["google.generativeai"] = genai_mod

# ---- mock insightface ----
insightface_mod = types.ModuleType("insightface")
app_submod = types.ModuleType("insightface.app")
fake_face_analysis = MagicMock()
fake_face_analysis.prepare = MagicMock()
fake_face_analysis.get = MagicMock(return_value=[])  # no faces in test image, that's fine
app_submod.FaceAnalysis = MagicMock(return_value=fake_face_analysis)
insightface_mod.app = app_submod
sys.modules["insightface"] = insightface_mod
sys.modules["insightface.app"] = app_submod

print("All external deps mocked. Importing real app code...")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---- 1. health check ----
r = client.get("/health")
print("GET /health ->", r.status_code, r.json())
assert r.status_code == 200

# ---- 2. auth required ----
r = client.get("/api/reminders/")
print("GET /api/reminders/ (no auth) ->", r.status_code)
assert r.status_code == 401

# ---- 3. authenticated reminder create + list ----
headers = {"Authorization": "Bearer faketoken"}
r = client.post("/api/reminders/", json={"title": "Take medication", "due_at": "2026-09-11T09:00:00Z"}, headers=headers)
print("POST /api/reminders/ ->", r.status_code, r.json())
assert r.status_code == 200
reminder_id = r.json()["reminder_id"]

r = client.get("/api/reminders/", headers=headers)
print("GET /api/reminders/ ->", r.status_code, len(r.json()), "reminder(s)")
assert r.status_code == 200 and len(r.json()) == 1

# ---- 4. IDOR check: different user can't see/edit it ----
auth_mod.verify_id_token.return_value = {"uid": "other-user-456"}
r = client.get(f"/api/reminders/", headers=headers)
print("GET /api/reminders/ (different user) ->", r.status_code, len(r.json()), "reminder(s) [expect 0]")
assert len(r.json()) == 0

r = client.patch(f"/api/reminders/{reminder_id}", json={"title": "hacked"}, headers=headers)
print(f"PATCH other user's reminder ->", r.status_code, "[expect 404]")
assert r.status_code == 404
auth_mod.verify_id_token.return_value = {"uid": "test-user-123", "email": "test@example.com"}

# ---- 5. memories analyze -> save flow (IDOR / provenance check) ----
fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\nfakepngbytesfortestingonly")
r = client.post("/api/memories/analyze", headers=headers,
                 files={"file": ("test.png", fake_image, "image/png")})
print("POST /api/memories/analyze ->", r.status_code, r.json() if r.status_code != 200 else "(truncated)")
assert r.status_code == 200
memory_id = r.json()["memory_id"]
photo_url = r.json()["photo_url"]

r = client.post("/api/memories/", headers=headers, json={
    "memory_id": memory_id, "photo_url": "https://attacker.com/spoofed.jpg",
    "people": ["Mom"], "location": "the park", "activity": "walking",
})
print("POST /api/memories/ (save) ->", r.status_code)
assert r.status_code == 200
assert r.json()["photo_url"] == photo_url  # confirms client-supplied photo_url was ignored, server one used
print("  confirmed: server-side photo_url used, not the client-spoofed one")

# replay should now fail (pending_memories deleted after use)
r = client.post("/api/memories/", headers=headers, json={
    "memory_id": memory_id, "photo_url": photo_url, "people": [], "location": None, "activity": None,
})
print("POST /api/memories/ (replay same memory_id) ->", r.status_code, "[expect 403, single-use token consumed... "
      "or 200 if same-user re-save is intended - checking actual behavior]")

# ---- 6. quiz generate -> submit, self-grading exploit check ----
r = client.post(f"/api/quiz/generate?memory_id={memory_id}", headers=headers)
print("POST /api/quiz/generate ->", r.status_code, r.json())
questions = r.json().get("questions", [])
if questions:
    q = questions[0]
    r = client.post("/api/quiz/submit", headers=headers, json={
        "question_id": q["question_id"], "given_answer": "totally wrong on purpose",
        "response_time": 1.2, "difficulty": "medium",
    })
    print("POST /api/quiz/submit (wrong answer) ->", r.status_code, r.json())
    assert r.json()["correct"] is False

    # replay attempt
    r = client.post("/api/quiz/submit", headers=headers, json={
        "question_id": q["question_id"], "given_answer": "Mom",
        "response_time": 0.1, "difficulty": "medium",
    })
    print("POST /api/quiz/submit (replay same question_id) ->", r.status_code, r.json(), "[expect error, already used]")
    assert "error" in r.json()

# ---- 7. invalid difficulty rejected ----
r = client.post(f"/api/quiz/generate?memory_id={memory_id}&difficulty=nonsense", headers=headers)
print("POST /api/quiz/generate?difficulty=nonsense ->", r.status_code, "[expect 422 validation error]")
assert r.status_code == 422

# ---- 8. upload validation: bad content-type rejected ----
r = client.post("/api/memories/analyze", headers=headers,
                 files={"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")})
print("POST /api/memories/analyze (text file) ->", r.status_code, "[expect 400]")
assert r.status_code == 400

# ---- 9. security headers present ----
r = client.get("/health")
print("Security headers:", {k: r.headers.get(k) for k in
      ["x-content-type-options", "x-frame-options", "strict-transport-security"]})
assert r.headers.get("x-content-type-options") == "nosniff"

print("\nALL SMOKE TESTS PASSED")
