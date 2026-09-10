# Tests for the SMRITI-AI Cognitive Care Platform
#
# Structure:
#   tests/
#     conftest.py        — shared fixtures
#     test_quiz.py       — quiz logic unit tests
#     test_audio.py      — TTS / narration tests
#     test_ai.py         — vision + face recognition tests
#     test_health.py     — full project health check (imports, routes, schemas, security)
#
# Run all:  pytest tests/ -v
# Run one:  pytest tests/test_quiz.py -v
