# SMRITI-AI Cognitive Care Platform

**SMRITI-AI** is a comprehensive, AI-powered Cognitive Care Platform backend designed to assist Alzheimer's and dementia patients, their caregivers, and doctors. It utilizes advanced computer vision, generative AI, and adaptive logic to help patients retain memories, recognize loved ones, and engage in cognitive exercises.

## 🌟 Key Features

* **AI Vision Analysis**: Automatically extracts context, activities, objects, and scenes from uploaded family photos using Google's Gemini 2.0 Flash (with a local fallback to LLaVA via Ollama if offline).
* **Face Recognition**: Built-in facial embedding extraction and matching using `insightface`. Automatically tags registered family members in patient memories.
* **Adaptive Cognitive Quizzes**: Dynamically generates quizzes based on verified patient memories (MCQs, free-text recall, chronological sequencing). Automatically scales difficulty (Easy, Medium, Hard) based on patient accuracy.
* **Audio Narration & Translation**: Converts written memories into multi-lingual audio stories (TTS) using Gemini translation and Google TTS, making it accessible for visually impaired or elderly patients.
* **Role-Based Access Control**: Secure endpoints explicitly divided into `admin`, `doctor`, `caregiver`, and `patient` roles, guarded via Firebase Auth.
* **Caregiver & Doctor Dashboards**: APIs designed for doctors to track cognitive decline over time through quiz history and weak-memory analysis.

---

## 🛠️ Technology Stack

* **Framework**: FastAPI (Python 3.11)
* **Database / Auth**: Firebase (Firestore & Firebase Auth)
* **AI & Vision**:
  * `google-genai` (Gemini 2.0 Flash for image analysis and text translation)
  * `insightface` & `opencv-python` (Facial recognition embeddings)
  * `gTTS` (Google Text-to-Speech)
* **Testing**: Pytest (50+ unit and integration tests)
* **DevOps**: Docker, Docker Compose, GitHub Actions (CI)

---

## 🚀 Getting Started

### 1. Prerequisites

You will need the following installed:
- Python 3.11+
- Docker & Docker Compose (Optional, for containerized deployment)
- A Firebase Project (with a downloaded `firebase-adminsdk.json` service account key)

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
FIREBASE_CREDENTIALS_PATH=./path-to-your-firebase-adminsdk.json
GEMINI_API_KEY=your_google_gemini_api_key

# Optional: For Cloudinary image storage (if enabled)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ENV=development
```

### 3. Local Installation (Without Docker)

```bash
# Clone the repository
git clone https://github.com/SOUMYADEEPDEY1217/SMRITI-AI.git
cd SMRITI-AI

# Install system dependencies (required for InsightFace/OpenCV)
sudo apt-get install libgl1-mesa-glx libglib2.0-0

# Install Python dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 4. Docker Installation (Recommended)

To run the entire backend via Docker:

```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000`.

---

## 🧪 Testing

The platform includes a rigorous 50-test Pytest suite covering AI boundaries, route security, and adaptive quiz logic. 

To run the tests locally:
```bash
pytest tests/ -v
```

Tests run automatically via **GitHub Actions** on every push to the `main` branch.

---

## 📚 API Documentation

Once the server is running, FastAPI automatically generates interactive documentation:
* **Swagger UI:** `http://localhost:8000/docs`
* **ReDoc:** `http://localhost:8000/redoc`

### Core Domain Routes:

* **`/api/memories`**: Upload photos, verify AI hypotheses, and generate audio narrations.
* **`/api/family-members`**: Enroll faces (generates InsightFace embeddings) and recognize faces in new photos.
* **`/api/quiz`**: Generate adaptive quizzes, submit answers, and allow doctors to fetch cognitive progress reports.
* **`/api/reminders`**: Manage daily routines (medications, appointments) for patients.
* **`/api/users`**: Manage role assignments and fetch patient clinical summaries.

---

## 🔒 Security & Architecture

* **Domain-Driven Design**: Logic is strictly separated into `api/routes` (HTTP) and `services` (Business logic).
* **Mass-Assignment Protection**: Pydantic schemas explicitly strip sensitive fields (e.g., `correct_answer` in quizzes, `photo_url` in verified memories) from client views.
* **Query Capping**: Firestore queries are strictly limited to `MAX_QUERY_RESULTS` (500) to prevent denial-of-wallet attacks.
* **Local Fallback**: If the Gemini API fails or timeouts, the vision service automatically falls back to a locally hosted Ollama/LLaVA instance to ensure the platform remains functional.

---

*Built with care for Cognitive Wellness.* 💙
