"""
tests/test_health.py
Full project health check — runs as a pytest test suite.
Covers: imports, routes, schemas, security invariants, config, rate limiter.
No network calls, no database calls.
"""
import pytest
from app.main import app
from app.core.limiter import limiter
from app.core.config import settings


EXPECTED_ROUTES = {
    ("POST", "/api/memories/analyze"),
    ("POST", "/api/memories/"),
    ("GET",  "/api/memories/"),
    ("GET",  "/api/memories/{memory_id}/narrate"),
    ("POST", "/api/memories/admin/patients/{patient_uid}/upload"),
    ("POST", "/api/memories/admin/patients/{patient_uid}/define"),
    ("GET",  "/api/memories/admin/patients/{patient_uid}"),
    ("GET",  "/api/memories/doctor/patients/{patient_uid}"),
    ("POST", "/api/family-members/enroll"),
    ("GET",  "/api/family-members/"),
    ("POST", "/api/family-members/recognize"),
    ("GET",  "/api/family-members/admin/patients/{patient_uid}"),
    ("GET",  "/api/family-members/doctor/patients/{patient_uid}"),
    ("POST", "/api/quiz/generate"),
    ("GET",  "/api/quiz/generate-sequence"),
    ("POST", "/api/quiz/submit"),
    ("GET",  "/api/quiz/weak-memories"),
    ("GET",  "/api/quiz/doctor/patients/{patient_uid}/progress"),
    ("GET",  "/api/quiz/doctor/patients/{patient_uid}/weak-memories"),
    ("GET",  "/api/quiz/doctor/patients/{patient_uid}/history"),
    ("POST", "/api/reminders/"),
    ("GET",  "/api/reminders/"),
    ("GET",  "/api/reminders/upcoming"),
    ("PATCH",   "/api/reminders/{reminder_id}"),
    ("POST", "/api/reminders/{reminder_id}/complete"),
    ("DELETE",  "/api/reminders/{reminder_id}"),
    ("GET",  "/api/reminders/admin/patients/{patient_uid}"),
    ("POST", "/api/reminders/admin/patients/{patient_uid}"),
    ("DELETE",  "/api/reminders/admin/patients/{patient_uid}/{reminder_id}"),
    ("GET",  "/api/reminders/doctor/patients/{patient_uid}/upcoming"),
    ("GET",  "/api/users/patients"),
    ("GET",  "/api/users/patients/{patient_uid}/profile"),
    ("POST", "/api/users/roles/assign"),
    ("GET",  "/api/users/patients/{patient_uid}/summary"),
    ("GET",  "/api/users/me"),
    ("PATCH", "/api/users/me"),
    ("POST", "/api/accessibility/translate"),
    ("GET",  "/api/accessibility/tts"),
    ("GET",  "/health"),
}


class TestRouteRegistry:
    def test_all_expected_routes_are_registered(self):
        actual = set()
        for route in app.routes:
            if hasattr(route, "methods") and hasattr(route, "path"):
                for method in route.methods:
                    actual.add((method, route.path))
        missing = EXPECTED_ROUTES - actual
        assert not missing, f"Missing routes: {missing}"

    def test_health_endpoint_registered(self):
        paths = [r.path for r in app.routes if hasattr(r, "path")]
        assert "/health" in paths

    def test_narrate_endpoint_registered(self):
        paths = [r.path for r in app.routes if hasattr(r, "path")]
        assert "/api/memories/{memory_id}/narrate" in paths


class TestModuleImports:
    def test_config_imports(self):
        from app.core.config import settings
        assert settings is not None

    def test_db_service_imports(self):
        from app.services import db_service
        assert callable(db_service.verify_id_token)
        assert callable(db_service.add_document)
        assert callable(db_service.query_by_field)
        assert callable(db_service.get_document)
        assert callable(db_service.update_document)
        assert callable(db_service.delete_document)

    def test_ai_service_imports(self):
        from app.services import ai_service
        assert callable(ai_service.analyze_photo)
        assert callable(ai_service.get_face_embeddings)
        assert callable(ai_service.match_face)
        assert callable(ai_service._ollama_fallback)

    def test_audio_logic_imports(self):
        from app.services import audio_logic
        assert callable(audio_logic.generate_audio)
        assert callable(audio_logic.translate_text)
        assert callable(audio_logic.narrate_memory)

    def test_storage_service_imports(self):
        from app.services import storage_service
        assert callable(storage_service.upload_photo)

    def test_auth_guards_import(self):
        from app.api.dependencies import get_current_user, get_admin_user, get_doctor_user
        assert callable(get_current_user)
        assert callable(get_admin_user)
        assert callable(get_doctor_user)


class TestSchemaSecurityInvariants:
    def test_verified_memory_has_no_photo_url_field(self):
        """SECURITY: photo_url must not be accepted from the client — mass-assignment vector."""
        from app.api.routes.memories import VerifiedMemory
        assert "photo_url" not in VerifiedMemory.model_fields

    def test_valid_role_is_closed_enum(self):
        from app.api.routes.users import ValidRole
        from typing import get_args
        allowed = set(get_args(ValidRole))
        assert allowed == {"patient", "caregiver", "doctor", "admin"}

    def test_quiz_response_time_has_bounds(self):
        from app.api.routes.quiz import QuizSubmission
        meta = QuizSubmission.model_fields["response_time"].metadata
        type_names = {type(m).__name__ for m in meta}
        assert "Ge" in type_names, "response_time must have ge=0 constraint"
        assert "Le" in type_names, "response_time must have le=3600 constraint"


class TestInfrastructure:
    def test_rate_limiter_attached_to_app(self):
        assert app.state.limiter is limiter

    def test_cors_no_wildcard(self):
        assert "*" not in settings.allowed_origins_list

    def test_firestore_query_cap_is_sane(self):
        from app.services.db_service import MAX_QUERY_RESULTS
        assert 50 <= MAX_QUERY_RESULTS <= 500

    def test_required_env_vars_present(self):
        assert settings.FIREBASE_CREDENTIALS_PATH
        assert settings.GEMINI_API_KEY
        assert settings.CLOUDINARY_CLOUD_NAME
        assert settings.CLOUDINARY_API_KEY
        assert settings.CLOUDINARY_API_SECRET

    def test_insightface_model_loaded(self):
        from app.services.ai_service import _face_app
        assert _face_app is not None

    def test_llava_fallback_is_wired(self):
        import inspect
        from app.services.ai_service import analyze_photo
        src = inspect.getsource(analyze_photo)
        assert "_ollama_fallback" in src
