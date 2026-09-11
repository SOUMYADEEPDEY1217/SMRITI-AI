import sys
import os
import io
from unittest.mock import patch

print("Importing app...")
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
headers = {"Authorization": "Bearer fake-token"}

print("Starting real end-to-end test flow...")

with patch("firebase_admin.auth.verify_id_token") as mock_verify, \
     patch("cloudinary.uploader.upload") as mock_cloudinary:
    mock_verify.return_value = {"uid": "test-real-user-1", "email": "test@example.com"}
    mock_cloudinary.return_value = {"secure_url": "https://fake.cloudinary.com/test.jpg"}

    # 1. Analyze Photo
    image_path = r"C:\Users\b2hkr\.gemini\antigravity-ide\brain\e98a35ee-9660-4098-bc8f-ddadb1610f16\test_memory_photo_1789019603074.jpg"
    print(f"Uploading image: {image_path}")
    
    with open(image_path, "rb") as f:
        r_analyze = client.post(
            "/api/memories/analyze", 
            headers=headers,
            files={"file": ("test.jpg", f, "image/jpeg")}
        )
    
    print("Analyze Status:", r_analyze.status_code)
    try:
        analyze_data = r_analyze.json()
        print("Analyze Result:", analyze_data)
    except:
        print("Analyze Text:", r_analyze.text)
        sys.exit(1)
        
    if r_analyze.status_code != 200:
        sys.exit(1)
        
    memory_id = analyze_data.get("memory_id")
    photo_url = analyze_data.get("photo_url")
    
    # 2. Save Memory
    print("\nSaving memory to Firestore...")
    save_payload = {
        "memory_id": memory_id,
        "photo_url": photo_url,
        "people": analyze_data.get("people", ["Mom", "Dad", "Kids"]),
        "location": analyze_data.get("location_hint", "Park"),
        "activity": analyze_data.get("activity", "Walking")
    }
    r_save = client.post("/api/memories/", headers=headers, json=save_payload)
    print("Save Status:", r_save.status_code)
    try:
        print("Save Result:", r_save.json())
    except:
        print("Save Text:", r_save.text)
    
    if r_save.status_code != 200:
        sys.exit(1)
        
    # 3. Generate Quiz
    print("\nGenerating quiz...")
    r_quiz = client.post(f"/api/quiz/generate?memory_id={memory_id}", headers=headers)
    print("Quiz Gen Status:", r_quiz.status_code)
    try:
        quiz_data = r_quiz.json()
        import json
        print("Quiz Result:\n", json.dumps(quiz_data, indent=2))
    except:
        print("Quiz Text:", r_quiz.text)
        sys.exit(1)

    print("\nEnd-to-End flow successful!")
