# 🧠 SMRITI-AI

### AI-Based Cognitive Gaming & Memory Assistance Platform for Elderly Dementia Patients

<p align="center">
  <b>Remember • Recognize • Reconnect</b>
</p>

<p align="center">
  An AI-powered cognitive assistance platform designed to transform personal memories into interactive recall activities for elderly users, with special focus on accessibility and culturally relevant care for India's North Eastern Region (NER).
</p>

---

## 🌟 About SMRITI-AI

**SMRITI-AI** is an AI-based cognitive gaming and memory assistance platform designed to support elderly people experiencing dementia and age-related memory decline.

Instead of relying only on generic brain-training exercises, SMRITI-AI uses **personal memories, family members, photographs, familiar objects and stories** to create personalized recall experiences.

Family members can upload meaningful photographs and enroll familiar faces. AI analyzes the memories, identifies known people, and converts verified memories into interactive cognitive questions.

The platform then tracks quiz performance and resurfaces weaker memories over time, creating a personalized **Recall Loop**.

> **SMRITI** means *memory/remembrance*, representing the project's goal of helping elderly users reconnect with meaningful people, places and moments from their lives.

---

# 🎯 Problem Statement

Elderly individuals experiencing dementia or cognitive decline often face:

* 🧠 Progressive memory loss
* 😕 Confusion and difficulty recognizing familiar people
* 😟 Anxiety and loss of confidence
* 🏠 Social isolation
* 👨‍👩‍👧 Dependence on family members and caregivers
* 🏥 Limited access to specialized cognitive-care facilities
* 🌐 Connectivity limitations in remote regions
* 🗣️ Lack of culturally familiar digital cognitive tools

These challenges can be especially significant in remote and rural regions where continuous specialist support may not always be easily accessible.

SMRITI-AI explores how **AI + personal memories + cognitive interaction** can provide an accessible digital companion for memory engagement.

---

# 💡 Proposed Solution

SMRITI-AI transforms family-provided memories into personalized cognitive experiences.

Instead of asking only generic questions, the system can use familiar photographs, people and events to generate memory-based activities.

### Core Idea

```text
Family Memories
      ↓
AI Understanding
      ↓
Face Recognition
      ↓
Family Verification
      ↓
Verified Memory
      ↓
Personalized Quiz
      ↓
Performance Tracking
      ↓
Adaptive Recall
      ↓
Memory Reinforcement
```

---

# ✨ Key Features

## 📸 Personalized Memory System

Family members can upload meaningful photographs containing:

* Family members
* Friends
* Important events
* Familiar places
* Daily-life moments
* Personal experiences

These memories become the foundation for personalized cognitive activities.

---

## 👤 Family Face Recognition

SMRITI-AI uses **InsightFace** to create face embeddings for enrolled family members.

Multiple photographs can be used during enrollment to improve recognition reliability.

When a memory photograph is uploaded, detected faces can be compared with previously enrolled family members.

---

## 🤖 AI Memory Understanding

Uploaded memory photographs are analyzed using AI vision capabilities.

The system can generate a hypothesis about:

* People
* Objects
* Activities
* Context
* Possible memory details

AI-generated information is treated as a **suggestion**, not automatically as the final memory.

---

## ✅ Human-in-the-Loop Memory Verification

One of the important design principles of SMRITI-AI is:

> **AI suggests — Family verifies.**

Before an AI-generated memory becomes part of the user's permanent memory collection, a family member can review and correct it.

This helps prevent inaccurate AI-generated descriptions from becoming trusted memories.

---

## 🎮 Personalized Cognitive Quizzes

Verified memories can automatically become cognitive questions.

Possible activities include:

* 👤 Person recognition
* 🖼️ Photo-based recall
* 🧩 Memory questions
* 🔢 Sequence recall
* ✍️ Free-text recall
* ☑️ Multiple-choice questions

Example:

```text
Memory:
"This photograph was taken during Rahul's birthday."

Question:
"What event was being celebrated?"

A. Wedding
B. Birthday
C. Festival
D. Picnic
```

---

## 🧬 Adaptive Recall

SMRITI-AI records quiz attempts and uses performance history to identify memories that may require additional reinforcement.

```text
Strong Memory
     ↓
Less Frequent Practice

Weak Memory
     ↓
More Frequent Recall
```

Weak memories can be resurfaced later to support repeated recall practice.

---

## 🔁 SMRITI Recall Loop

The central interaction cycle is:

```text
Remember
   ↓
Recognize
   ↓
Recall
   ↓
Evaluate
   ↓
Reinforce
   ↓
Repeat
```

This creates an evolving memory-engagement experience rather than a fixed set of questions.

---

## ⏰ Smart Reminders

The backend includes reminder functionality for everyday assistance.

Reminders can support activities such as:

* 💊 Medication
* 🧠 Cognitive activities
* 🩺 Appointments
* 💧 Hydration
* 📅 Daily routines

Recurring reminder patterns can also be supported.

---

## 👨‍👩‍👧 Family-Centered Design

Family members are an important part of the system.

They help build the user's digital memory collection by:

```text
Uploading Photos
      ↓
Adding Familiar People
      ↓
Reviewing AI Suggestions
      ↓
Correcting Memories
      ↓
Creating Trusted Memories
      ↓
Supporting Cognitive Recall
```

This creates a collaborative memory ecosystem instead of an isolated cognitive-training application.

---

# 🌄 Focus on North Eastern Region (NER)

SMRITI-AI is designed with the long-term goal of supporting culturally inclusive cognitive assistance.

Potential NER-focused personalization includes:

* Regional languages
* Familiar cultural objects
* Local festivals
* Traditional clothing
* Regional food
* Familiar locations
* Family traditions
* Local stories
* Voice-based interaction

The objective is to make cognitive engagement feel **personal and culturally familiar**.

---

# 🏗️ System Architecture

```text
              ┌─────────────────────┐
              │   Elderly User /    │
              │ Family / Caregiver  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │     Client / UI     │
              └──────────┬──────────┘
                         │
                    REST / HTTPS
                         │
                         ▼
              ┌─────────────────────┐
              │   FastAPI Backend   │
              │                     │
              │ Authentication      │
              │ Memory Management   │
              │ Quiz Engine         │
              │ Reminders           │
              │ Adaptive Recall     │
              └──────────┬──────────┘
                         │
          ┌──────────────┼───────────────┐
          │              │               │
          ▼              ▼               ▼
    ┌───────────┐ ┌────────────┐ ┌────────────┐
    │ Gemini AI │ │InsightFace │ │ Cloudinary │
    │  Vision   │ │Face Engine │ │   Images   │
    └───────────┘ └────────────┘ └────────────┘
          │              │               │
          └──────────────┼───────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    Firestore    │
                │                 │
                │ Users           │
                │ Memories        │
                │ Family Members  │
                │ Quiz Attempts   │
                │ Reminders       │
                └─────────────────┘
```

---

# 🔄 Memory Processing Workflow

```text
1. Family Member Enrollment
          ↓
2. Upload Memory Photograph
          ↓
3. Store Image
          ↓
4. AI Vision Analysis
          ↓
5. Face Detection & Recognition
          ↓
6. Generate Memory Hypothesis
          ↓
7. Family Reviews Information
          ↓
8. Family Confirms / Corrects
          ↓
9. Save Verified Memory
          ↓
10. Generate Cognitive Questions
          ↓
11. Elderly User Answers
          ↓
12. Server-Side Evaluation
          ↓
13. Record Performance
          ↓
14. Identify Weak Memories
          ↓
15. Adaptive Recall
```

---

# 🛠️ Technology Stack

| Layer                   | Technology              |
| ----------------------- | ----------------------- |
| ⚙️ Backend              | FastAPI                 |
| 🐍 Programming          | Python                  |
| 📦 Validation           | Pydantic                |
| 🔥 Authentication       | Firebase Authentication |
| 🗄️ Database            | Cloud Firestore         |
| ☁️ Image Storage        | Cloudinary              |
| 🤖 AI Vision            | Google Gemini           |
| 👤 Face Recognition     | InsightFace             |
| ⚡ Face Inference        | ONNX Runtime            |
| 🖼️ Image Processing    | Pillow                  |
| 🔢 Numerical Processing | NumPy                   |
| 🌐 HTTP Client          | HTTPX / Requests        |
| 🔊 Text-to-Speech       | gTTS                    |
| 🛡️ Rate Limiting       | SlowAPI                 |
| 🧪 Testing              | Pytest                  |
| 🚀 API Server           | Uvicorn                 |

---

# 📂 Project Structure

```text
SMRITI-AI/
│
├── app/
│   │
│   ├── main.py
│   ├── config.py
│   ├── limiter.py
│   │
│   ├── routers/
│   │   ├── family_members.py
│   │   ├── memories.py
│   │   ├── quiz.py
│   │   └── reminders.py
│   │
│   └── services/
│       ├── auth_dependency.py
│       ├── firebase_service.py
│       ├── cloudinary_service.py
│       ├── face_service.py
│       ├── vision_service.py
│       └── quiz_service.py
│
├── docs/
│   ├── architecture.md
│   ├── dna.md
│   ├── session.md
│   ├── techstack.md
│   └── workflow.md
│
├── real_test.py
├── smoke_test.py
├── test_accessibility.py
├── requirements.txt
└── .gitignore
```

---

# 🔐 Security

SMRITI-AI incorporates multiple backend security controls.

### Authentication

Firebase ID tokens are used for authenticated API requests.

```text
Authorization: Bearer <Firebase-ID-Token>
```

### Authorization

Resources are scoped to their owners to prevent users from accessing another user's private memory information.

### Upload Protection

Uploaded images are validated for:

* Supported content type
* Maximum file size
* Empty files
* Image processing safety

### Memory Verification

A generated memory cannot simply be submitted as another user's memory.

Memory provenance is checked before verified memories are stored.

### Secure Quiz Evaluation

Correct answers are stored and evaluated server-side rather than trusting answers supplied by the client.

This reduces answer manipulation and replay-based exploits.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/SOUMYADEEPDEY1217/SMRITI-AI.git
cd SMRITI-AI
```

---

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

# 🔑 Environment Configuration

Create a `.env` file in the project root.

Example configuration:

```env
GEMINI_API_KEY=your_gemini_api_key

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava

# Add Firebase configuration / credentials
# Add Cloudinary credentials
# according to app/config.py
```

> Never commit API keys, Firebase credentials or Cloudinary secrets to GitHub.

---

# ▶️ Running the Backend

From the repository root:

```bash
uvicorn app.main:app --reload
```

The development API will normally run at:

```text
http://127.0.0.1:8000
```

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

Alternative API documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# 🧪 Running Tests

The repository contains smoke, integration and accessibility-related testing files.

Run the test suite using:

```bash
pytest
```

Individual tests can also be executed:

```bash
python smoke_test.py
python real_test.py
python test_accessibility.py
```

---

# 🔌 Core API Modules

The backend is organized around separate FastAPI routers.

### 👤 Family Members

Responsible for:

```text
Enroll Family Member
        ↓
Store Face Embeddings
        ↓
Recognize Familiar Faces
```

### 🧠 Memories

Responsible for:

```text
Upload Photo
     ↓
Analyze Memory
     ↓
Generate Hypothesis
     ↓
Family Verification
     ↓
Save Verified Memory
```

### 🎮 Quiz

Responsible for:

```text
Verified Memory
      ↓
Generate Questions
      ↓
User Answers
      ↓
Server-Side Grading
      ↓
Store Quiz Attempt
      ↓
Identify Weak Memories
```

### ⏰ Reminders

Responsible for reminder creation, retrieval, updates and recurring schedules.

---

# 🚀 Innovation

SMRITI-AI combines several ideas into one cognitive-assistance workflow.

### 🌱 Memory Garden

Personal photographs and stories become a growing collection of verified digital memories.

### 🧬 Cognitive Fingerprint

Interaction and quiz history can provide a personalized picture of which memories are stronger or require more reinforcement.

### 🔁 Recall Loop

Weak memories can be resurfaced through repeated personalized activities.

### 👨‍👩‍👧 Family Co-Creation

Family members actively contribute to the user's cognitive experience instead of the system relying only on generic content.

### ❤️ Personal Memory-Based Engagement

The system focuses on memories that have personal meaning to the user.

### 🌄 Cultural Personalization

The platform is intended to support culturally familiar experiences for users in Northeast India.

---

# 🆚 Traditional Cognitive Apps vs SMRITI-AI

| Traditional Approach     | SMRITI-AI                                  |
| ------------------------ | ------------------------------------------ |
| Generic brain games      | Personalized memory-based activities       |
| Predefined questions     | Questions generated from verified memories |
| Generic photographs      | Family-provided personal photographs       |
| Limited personalization  | User-specific recall history               |
| Individual experience    | Family co-creation                         |
| Generic content          | NER-focused cultural personalization       |
| Fixed exercises          | Adaptive weak-memory resurfacing           |
| AI-generated information | Human-verified memory workflow             |

---

# 🗺️ Future Roadmap

Planned and potential improvements include:

* 👨‍⚕️ Caregiver dashboard
* 📊 Cognitive engagement analytics
* 🎮 Additional attention and pattern-recognition games
* 🗣️ Multilingual voice assistant
* 🌄 Northeast Indian regional-language support
* 📴 Improved offline capabilities
* 🎵 Voice and music-based memories
* 📍 Place-based memory activities
* 🔔 Advanced reminder notifications
* 📱 Elderly-friendly mobile interface
* 📈 Long-term cognitive engagement visualization
* 🧠 More adaptive cognitive activities

---

# ⚠️ Current Limitations

SMRITI-AI is currently a prototype/research-oriented platform.

Some functionality is still under development, including:

* Full caregiver dashboard
* Advanced non-quiz cognitive games
* Complete offline AI processing
* Production-scale deployment
* Extensive clinical validation

Cloud-based AI functionality may require internet connectivity.

---

# 🩺 Medical Disclaimer

SMRITI-AI is intended as a **cognitive engagement and memory-assistance platform**.

It is **not a medical diagnostic system** and should not be used to diagnose, treat, cure or prevent dementia or any other medical condition.

Cognitive performance data generated by the platform should be treated as engagement information rather than a clinical diagnosis.

Medical decisions should always be made with qualified healthcare professionals.

---

# 🎯 Project Vision

Our vision is to create technology where AI does not simply generate content—it helps families transform meaningful memories into accessible cognitive experiences.

```text
Personal Memories
       +
Artificial Intelligence
       +
Family Participation
       +
Adaptive Recall
       ↓
Meaningful Cognitive Engagement
```

SMRITI-AI aims to make cognitive assistance more:

**Personal • Accessible • Familiar • Inclusive • Family-Centered**

---

# 🤝 Contributing

Contributions are welcome.

```bash
# Fork the repository

# Clone your fork
git clone https://github.com/YOUR_USERNAME/SMRITI-AI.git

# Create a new branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "Add new feature"

# Push the branch
git push origin feature/your-feature
```

Then create a Pull Request.

---

# ⭐ Support the Project

If you find **SMRITI-AI** interesting or useful, consider giving the repository a ⭐.

Your support helps encourage further development of accessible AI-based cognitive assistance technologies.

---

<p align="center">
  <b>🧠 SMRITI-AI</b>
</p>

<p align="center">
  <i>Helping memories live longer through AI, family and meaningful recall.</i>
</p>

<p align="center">
  ❤️ Remember • Recognize • Reconnect
</p>
