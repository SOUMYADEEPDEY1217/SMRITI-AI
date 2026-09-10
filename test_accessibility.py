import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_accessibility():
    print("Testing translation...")
    
    # Mock firebase auth to bypass security
    with patch("firebase_admin.auth.verify_id_token") as mock_verify:
        mock_verify.return_value = {"uid": "test-user-1", "email": "test@example.com"}
        
        # Test Translate (English -> Hindi)
        payload = {
            "text": "Hello, how are you today? Let's take a memory quiz.",
            "target_lang": "Hindi"
        }
        headers = {"Authorization": "Bearer fake_token"}
        
        response = client.post("/api/accessibility/translate", json=payload, headers=headers)
        print(f"Translate Status: {response.status_code}")
        print(f"Translate Response: {response.json()}")
        
        # Test TTS (Hindi)
        print("\nTesting TTS (Text-to-Speech)...")
        hindi_text = response.json().get("translated_text", "नमस्ते")
        
        tts_response = client.get(f"/api/accessibility/tts?text={hindi_text}&lang_code=hi", headers=headers)
        print(f"TTS Status: {tts_response.status_code}")
        print(f"TTS Content Type: {tts_response.headers.get('content-type')}")
        
        if tts_response.status_code == 200:
            # Save the audio file to verify it works
            with open("test_audio.mp3", "wb") as f:
                f.write(tts_response.content)
            print(f"Saved audio output to test_audio.mp3 ({len(tts_response.content)} bytes)")
        
if __name__ == "__main__":
    test_accessibility()
