// Cognitive Care Unified Frontend API Client
// Uses native fetch() to communicate with FastAPI backend at http://localhost:8000
// Seamlessly synchronizes with localStorage for offline resilience and fast interactions.

import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getPatients,
  getPatientById,
  savePatient,
  getStaff,
  saveStaff,
  getActivities,
  getQuestions,
  saveQuestion,
  deleteQuestion,
  getMedia,
  saveMediaItem,
  deleteMediaItem,
  getAllSessions,
  getPatientSessions,
  saveActivityResult as saveLocalActivityResult,
  getCognitiveDomains,
  getSelectedLanguage,
  setSelectedLanguage
} from './storage';

const API_BASE_URL = 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('smriti_auth_token') || 'demo-patient-token';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & SESSION
// -------------------------------------------------------------
export async function loginUser(username, password, role = 'patient') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('smriti_auth_token', data.token);
      }
      if (data.user) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using local authentication fallback.');
  }

  // Resilient fallback
  if (role === 'patient') {
    const patients = getPatients();
    const user = { ...(patients[0] || {}), role: 'patient' };
    setCurrentUser(user);
    localStorage.setItem('smriti_auth_token', 'demo-patient-token');
    return { success: true, user };
  } else if (role === 'doctor') {
    const staff = getStaff();
    const user = { ...(staff[0] || {}), role: 'doctor' };
    setCurrentUser(user);
    localStorage.setItem('smriti_auth_token', 'demo-doctor-token');
    return { success: true, user };
  } else {
    const user = {
      id: 'admin-1',
      name: 'System Administrator',
      role: 'admin',
      email: 'admin@cognitivecare.com'
    };
    setCurrentUser(user);
    localStorage.setItem('smriti_auth_token', 'demo-admin-token');
    return { success: true, user };
  }
}

export async function signupUser(name, email, password, role = 'patient', language = 'en') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, language })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('smriti_auth_token', data.token);
      }
      if (data.user) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
    }
  } catch (err) {
    console.warn('Backend signup fallback to local store.');
  }

  const user = {
    id: `${role}-${Date.now()}`,
    name,
    email,
    role,
    language,
    difficulty: 'Medium'
  };
  setCurrentUser(user);
  localStorage.setItem('smriti_auth_token', `demo-${role}-token`);
  return { success: true, user };
}

export function logoutUser() {
  clearCurrentUser();
  localStorage.removeItem('smriti_auth_token');
}

// -------------------------------------------------------------
// 2. ACTIVITY RESULT RECORDING & ADAPTIVE PACING
// -------------------------------------------------------------
export async function submitActivityResult(patientId, resultData) {
  // Always update local storage first so patient data is never lost
  const localResult = saveLocalActivityResult(patientId, resultData);

  try {
    const res = await fetch(`${API_BASE_URL}/api/activities/result`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        patient_id: patientId,
        activity_id: resultData.activityId,
        activity_name: resultData.activityName,
        score: resultData.score,
        accuracy: resultData.accuracy,
        mistakes: resultData.mistakes || 0,
        correct_answers: resultData.correctAnswers || 1,
        response_time_sec: resultData.responseTimeSec || 4.0,
        difficulty: resultData.difficulty || 'medium'
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        session: data.session || localResult.session,
        adaptiveDecision: {
          newDifficulty: data.next_difficulty || localResult.adaptiveDecision.newDifficulty,
          change: data.difficulty_change || localResult.adaptiveDecision.change,
          message: data.feedback_note || localResult.adaptiveDecision.message
        }
      };
    }
  } catch (e) {
    // Graceful offline fallback
  }

  return localResult;
}

// -------------------------------------------------------------
// 3. CLINICIAN PORTAL DATA
// -------------------------------------------------------------
export async function fetchClinicianPatients() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinician/patients`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Fallback to local patients
  }
  return getPatients();
}

export async function fetchPatientDetail(patientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinician/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  const patient = getPatientById(patientId);
  const sessions = getPatientSessions(patientId);
  const domains = getCognitiveDomains(patientId);
  return { patient, sessions, cognitive_domains: domains };
}

export async function savePatientNote(patientId, noteText) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinician/patient/${patientId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text: noteText })
    });
    if (res.ok) {
      const data = await res.json();
      return data.notes;
    }
  } catch (e) {
    // Fallback
  }

  const patient = getPatientById(patientId);
  const notes = patient.notes || [];
  notes.unshift({
    date: new Date().toISOString().split('T')[0],
    author: 'Dr. Ananya Sharma',
    text: noteText
  });
  savePatient({ ...patient, notes });
  return notes;
}

// -------------------------------------------------------------
// 4. ADMIN PORTAL DATA
// -------------------------------------------------------------
export async function fetchAdminData(entity) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/${entity}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback to localStorage data
  }

  if (entity === 'patients') return getPatients();
  if (entity === 'staff') return getStaff();
  if (entity === 'activities') return getActivities();
  if (entity === 'questions') return getQuestions();
  if (entity === 'media') return getMedia();
  return [];
}

export async function adminCreateEntity(entity, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/${entity}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return { status: 'local', data };
}

export async function adminDeleteEntity(entity, id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/${entity}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return { status: 'local' };
}

// -------------------------------------------------------------
// 5. FAMILY MEMBERS
// -------------------------------------------------------------
function getAuthHeadersMultipart() {
  const token = localStorage.getItem('smriti_auth_token') || 'demo-patient-token';
  return { 'Authorization': `Bearer ${token}` };
}

export async function enrollFamilyMember(name, relationship, photoFiles) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('relationship', relationship);
  for (const file of photoFiles) {
    formData.append('files', file);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/family-members/enroll`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Enrollment failed' };
  } catch (e) {
    return { error: 'Backend unavailable. Cannot enroll without the AI service.' };
  }
}

export async function listFamilyMembers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/family-members/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return [];
}

export async function recognizeFaces(photoFile) {
  const formData = new FormData();
  formData.append('file', photoFile);
  try {
    const res = await fetch(`${API_BASE_URL}/api/family-members/recognize`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Recognition failed' };
  } catch (e) {
    return { error: 'Backend unavailable for face recognition.' };
  }
}

// -------------------------------------------------------------
// 6. MEMORIES
// -------------------------------------------------------------
export async function analyzeMemoryPhoto(photoFile) {
  const formData = new FormData();
  formData.append('file', photoFile);
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/analyze`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Analysis failed' };
  } catch (e) {
    return { error: 'Backend unavailable. Photo analysis requires the AI service.' };
  }
}

export async function saveVerifiedMemory(memoryData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memoryData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Save failed' };
  } catch (e) {
    return { error: 'Backend unavailable. Cannot save memory.' };
  }
}

export async function listMemories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/memories/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return [];
}

// -------------------------------------------------------------
// 7. QUIZ (AI-GENERATED)
// -------------------------------------------------------------
export async function generateQuiz(memoryId, difficulty = 'medium') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/generate?memory_id=${encodeURIComponent(memoryId)}&difficulty=${difficulty}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || err.error || 'Quiz generation failed' };
  } catch (e) {
    return { error: 'Backend unavailable for quiz generation.' };
  }
}

export async function generateSequenceQuiz(limit = 5) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/generate-sequence?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || err.error || 'Sequence quiz generation failed' };
  } catch (e) {
    return { error: 'Backend unavailable for sequence quiz.' };
  }
}

export async function submitQuizAnswer(questionId, givenAnswer, responseTime, difficulty = 'medium') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_id: questionId,
        given_answer: givenAnswer,
        response_time: responseTime,
        difficulty
      })
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || err.error || 'Submission failed' };
  } catch (e) {
    return { error: 'Backend unavailable for quiz submission.' };
  }
}

export async function getWeakMemories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/weak-memories`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return [];
}

// -------------------------------------------------------------
// 8. REMINDERS
// -------------------------------------------------------------
export async function createReminder(title, notes, dueAt, recurrence = 'none', category = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, notes, due_at: dueAt, recurrence, category })
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Failed to create reminder' };
  } catch (e) {
    return { error: 'Backend unavailable. Reminders require the server.' };
  }
}

export async function listReminders(includeCompleted = false) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/?include_completed=${includeCompleted}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return [];
}

export async function getUpcomingReminders(withinHours = 24) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/upcoming?within_hours=${withinHours}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return [];
}

export async function updateReminder(reminderId, changes) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(changes)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Update failed' };
  } catch (e) {
    return { error: 'Backend unavailable.' };
  }
}

export async function completeReminder(reminderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/${reminderId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    return { error: err.detail || 'Complete failed' };
  } catch (e) {
    return { error: 'Backend unavailable.' };
  }
}

export async function deleteReminder(reminderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return { deleted: false };
}

// -------------------------------------------------------------
// 9. ACCESSIBILITY (Translation & TTS)
// -------------------------------------------------------------
export async function translateText(text, targetLang) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/accessibility/translate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, target_lang: targetLang })
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return { translated_text: text, original_text: text, target_lang: targetLang };
}

export function getTTSAudioUrl(text, langCode = 'hi') {
  const token = localStorage.getItem('smriti_auth_token') || 'demo-patient-token';
  return `${API_BASE_URL}/api/accessibility/tts?text=${encodeURIComponent(text)}&lang_code=${langCode}&token=${encodeURIComponent(token)}`;
}

// -------------------------------------------------------------
// 10. ACTIVITY PROGRESS & CLINICIAN EXTRAS
// -------------------------------------------------------------
export async function fetchActivityProgress(patientId) {
  try {
    const url = patientId
      ? `${API_BASE_URL}/api/activities/progress?patient_id=${patientId}`
      : `${API_BASE_URL}/api/activities/progress`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return null;
}

export async function updatePatientDifficulty(patientId, difficulty) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinician/patient/${patientId}/difficulty`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ difficulty })
    });
    if (res.ok) return await res.json();
  } catch (e) { /* offline */ }
  return { status: 'local' };
}
