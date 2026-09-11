// SMRITI LocalStorage Storage Management Module
import {
  INITIAL_USERS,
  INITIAL_ACTIVITIES,
  INITIAL_QUESTIONS,
  INITIAL_MEDIA,
  INITIAL_PATIENT_SESSIONS,
  INITIAL_COGNITIVE_DOMAINS
} from './initialData';
import { evaluateAdaptiveDifficulty } from '../utils/adaptiveDifficulty';

const STORAGE_KEYS = {
  CURRENT_USER: 'smriti_current_user',
  PATIENTS: 'smriti_patients',
  STAFF: 'smriti_staff',
  ACTIVITIES: 'smriti_activities',
  QUESTIONS: 'smriti_questions',
  MEDIA: 'smriti_media',
  SESSIONS: 'smriti_sessions',
  COGNITIVE_DOMAINS: 'smriti_cognitive_domains',
  LANGUAGE: 'smriti_selected_language',
  INITIALIZED: 'smriti_initialized_v1'
};

// Initialize Storage with Seed Data if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_USERS.patients));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_USERS.doctors));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_PATIENT_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.COGNITIVE_DOMAINS, JSON.stringify(INITIAL_COGNITIVE_DOMAINS));
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'en');

    // Default current user to patient 1 (Ramesh Patel)
    const defaultUser = {
      ...INITIAL_USERS.patients[0],
      role: 'patient'
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Ensure storage is initialized on import
initStorage();

// Current User Authentication State
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Language Preferences for Patient
export function getSelectedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  } catch (e) {
    return 'en';
  }
}

export function setSelectedLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Error saving language preference:', e);
  }
}

// Patients
export function getPatients() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS)) || [];
  } catch (e) {
    return INITIAL_USERS.patients;
  }
}

export function getPatientById(id) {
  const patients = getPatients();
  return patients.find(p => p.id === id) || patients[0];
}

export function savePatient(patientData) {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patientData.id);
  if (index >= 0) {
    patients[index] = { ...patients[index], ...patientData };
  } else {
    const newId = patientData.id || `patient-${Date.now()}`;
    patients.push({
      id: newId,
      difficulty: 'Medium',
      riskStatus: 'Stable',
      registeredDate: new Date().toISOString().split('T')[0],
      ...patientData
    });
  }
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  return patients;
}

export function deletePatient(id) {
  const patients = getPatients().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  return patients;
}

// Staff (Doctors / Nurses)
export function getStaff() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF)) || [];
  } catch (e) {
    return INITIAL_USERS.doctors;
  }
}

export function saveStaff(staffData) {
  const staffList = getStaff();
  const index = staffList.findIndex(s => s.id === staffData.id);
  if (index >= 0) {
    staffList[index] = { ...staffList[index], ...staffData };
  } else {
    const newId = staffData.id || `staff-${Date.now()}`;
    staffList.push({ id: newId, ...staffData });
  }
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  return staffList;
}

export function deleteStaff(id) {
  const staffList = getStaff().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  return staffList;
}

// Activities
export function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) || INITIAL_ACTIVITIES;
  } catch (e) {
    return INITIAL_ACTIVITIES;
  }
}

export function getActivityById(id) {
  const activities = getActivities();
  return activities.find(a => a.id === id);
}

export function updateActivity(updatedActivity) {
  const activities = getActivities().map(act =>
    act.id === updatedActivity.id ? { ...act, ...updatedActivity } : act
  );
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  return activities;
}

// Questions
export function getQuestions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS)) || INITIAL_QUESTIONS;
  } catch (e) {
    return INITIAL_QUESTIONS;
  }
}

export function getQuestionsForActivity(activityId, difficulty = null) {
  const all = getQuestions();
  let filtered = all.filter(q => q.activityId === activityId);
  if (difficulty && difficulty !== 'All Levels') {
    const diffMatch = filtered.filter(q => q.difficulty?.toLowerCase() === difficulty?.toLowerCase());
    if (diffMatch.length > 0) return diffMatch;
  }
  return filtered.length > 0 ? filtered : all;
}

export function saveQuestion(questionData) {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === questionData.id);
  if (index >= 0) {
    questions[index] = { ...questions[index], ...questionData };
  } else {
    const newId = questionData.id || `q-${Date.now()}`;
    questions.push({ id: newId, ...questionData });
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  return questions;
}

export function deleteQuestion(id) {
  const questions = getQuestions().filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  return questions;
}

// Media
export function getMedia() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA)) || INITIAL_MEDIA;
  } catch (e) {
    return INITIAL_MEDIA;
  }
}

export function saveMediaItem(type, item) {
  const media = getMedia();
  if (type === 'photos') {
    const index = media.photos.findIndex(p => p.id === item.id);
    if (index >= 0) {
      media.photos[index] = { ...media.photos[index], ...item };
    } else {
      media.photos.push({ id: `photo-${Date.now()}`, dateAdded: new Date().toISOString().split('T')[0], ...item });
    }
  } else if (type === 'audio') {
    const index = media.audio.findIndex(a => a.id === item.id);
    if (index >= 0) {
      media.audio[index] = { ...media.audio[index], ...item };
    } else {
      media.audio.push({ id: `audio-${Date.now()}`, ...item });
    }
  }
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  return media;
}

export function deleteMediaItem(type, id) {
  const media = getMedia();
  if (type === 'photos') {
    media.photos = media.photos.filter(p => p.id !== id);
  } else if (type === 'audio') {
    media.audio = media.audio.filter(a => a.id !== id);
  }
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  return media;
}

// Sessions and Scores
export function getAllSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS)) || INITIAL_PATIENT_SESSIONS;
  } catch (e) {
    return INITIAL_PATIENT_SESSIONS;
  }
}

export function getPatientSessions(patientId) {
  const all = getAllSessions();
  return all.filter(s => s.patientId === patientId);
}

// Save Activity Result & Process Adaptive Difficulty
export function saveActivityResult(patientId, resultData) {
  const sessions = getAllSessions();
  const patient = getPatientById(patientId);
  const currentDiff = resultData.difficulty || patient.difficulty || 'Medium';

  // Calculate Adaptive Difficulty via JS engine
  const adaptiveDecision = evaluateAdaptiveDifficulty(currentDiff, resultData.score);

  const newSession = {
    sessionId: `sess-${Date.now()}`,
    patientId: patientId,
    activityId: resultData.activityId,
    activityName: resultData.activityName,
    date: new Date().toISOString().split('T')[0],
    score: resultData.score,
    accuracy: resultData.accuracy,
    mistakes: resultData.mistakes,
    correctAnswers: resultData.correctAnswers,
    responseTimeSec: resultData.responseTimeSec || 4.5,
    difficulty: currentDiff,
    newDifficulty: adaptiveDecision.newDifficulty,
    difficultyChange: adaptiveDecision.change,
    feedbackNote: adaptiveDecision.message,
    status: 'Completed'
  };

  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  // Update Patient's current difficulty level
  const updatedPatients = getPatients().map(p => {
    if (p.id === patientId) {
      return { ...p, difficulty: adaptiveDecision.newDifficulty };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));

  // Update Cognitive Domains
  updateCognitiveDomainFromActivity(patientId, resultData.activityId, resultData.score);

  // Asynchronously sync session to FastAPI backend
  try {
    const token = localStorage.getItem('smriti_auth_token') || 'demo-patient-token';
    fetch('http://localhost:8000/api/activities/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        patient_id: patientId,
        activity_id: resultData.activityId,
        activity_name: resultData.activityName,
        score: resultData.score,
        accuracy: resultData.accuracy,
        mistakes: resultData.mistakes || 0,
        correct_answers: resultData.correctAnswers || 1,
        response_time_sec: resultData.responseTimeSec || 4.5,
        difficulty: (currentDiff || 'medium').toLowerCase()
      })
    }).catch(() => {});
  } catch (e) {
    // Non-blocking
  }

  return {
    session: newSession,
    adaptiveDecision
  };
}

// Cognitive Domains
export function getCognitiveDomains(patientId) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.COGNITIVE_DOMAINS)) || INITIAL_COGNITIVE_DOMAINS;
    return raw[patientId] || INITIAL_COGNITIVE_DOMAINS['patient-1'];
  } catch (e) {
    return INITIAL_COGNITIVE_DOMAINS['patient-1'];
  }
}

function updateCognitiveDomainFromActivity(patientId, activityId, score) {
  try {
    const domainMap = {
      'memory-garden': 'visualMemory',
      'familiar-face': 'faceRecognition',
      'lifestory': 'semanticKnowledge',
      'memory-radio': 'auditoryMemory',
      'daily-companion': 'temporalOrientation',
      'memory-walk': 'sequentialMemory',
      'culture-quest': 'semanticKnowledge',
      'recall-loop': 'delayedRecall',
      'family-puzzle': 'patternMatching'
    };

    const domainKey = domainMap[activityId];
    if (!domainKey) return;

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.COGNITIVE_DOMAINS)) || INITIAL_COGNITIVE_DOMAINS;
    const patientDomain = raw[patientId] || { ...INITIAL_COGNITIVE_DOMAINS['patient-1'] };

    // Weighted moving average: 70% previous + 30% current session score
    const currentVal = patientDomain[domainKey] || 75;
    const updatedVal = Math.round(currentVal * 0.7 + score * 0.3);
    patientDomain[domainKey] = Math.max(10, Math.min(100, updatedVal));

    raw[patientId] = patientDomain;
    localStorage.setItem(STORAGE_KEYS.COGNITIVE_DOMAINS, JSON.stringify(raw));
  } catch (err) {
    console.error('Error updating cognitive domain:', err);
  }
}
