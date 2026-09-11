import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Background3D from './components/common/Background3D';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/login/LoginPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import ResultScreen from './pages/patient/ResultScreen';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientProfile from './pages/doctor/PatientProfile';
import AdminDashboard from './pages/admin/AdminDashboard';

// New Feature Pages
import MemoriesPage from './pages/patient/MemoriesPage';
import FamilyMembersPage from './pages/patient/FamilyMembersPage';
import RemindersPage from './pages/patient/RemindersPage';
import QuizPage from './pages/patient/QuizPage';

// 10 Patient Activities
import MemoryGarden from './activities/MemoryGarden';
import FamiliarFace from './activities/FamiliarFace';
import LifeStory from './activities/LifeStory';
import MemoryRadio from './activities/MemoryRadio';
import DailyCompanion from './activities/DailyCompanion';
import MemoryWalk from './activities/MemoryWalk';
import CultureQuest from './activities/CultureQuest';
import RecallLoop from './activities/RecallLoop';
import FamilyPuzzle from './activities/FamilyPuzzle';
import CognitiveFingerprint from './activities/CognitiveFingerprint';

// Layout wrapper: displays portal Navbar on authenticated screens
function AppLayout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="cognitive-care-shell" style={{ position: 'relative', zIndex: 1 }}>
      <Background3D />
      {!hideNavbar && <Navbar />}
      <main className="app-main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication & Role Selection */}
          <Route path="/login" element={<LoginPage />} />

          {/* Patient Portal */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/result" element={<ResultScreen />} />
          <Route path="/patient/fingerprint" element={<CognitiveFingerprint />} />
          <Route path="/patient/memories" element={<MemoriesPage />} />
          <Route path="/patient/family" element={<FamilyMembersPage />} />
          <Route path="/patient/reminders" element={<RemindersPage />} />
          <Route path="/patient/quiz" element={<QuizPage />} />

          {/* The 10 Cognitive Activities */}
          <Route path="/patient/activity/memory-garden" element={<MemoryGarden />} />
          <Route path="/patient/activity/familiar-face" element={<FamiliarFace />} />
          <Route path="/patient/activity/lifestory" element={<LifeStory />} />
          <Route path="/patient/activity/memory-radio" element={<MemoryRadio />} />
          <Route path="/patient/activity/daily-companion" element={<DailyCompanion />} />
          <Route path="/patient/activity/memory-walk" element={<MemoryWalk />} />
          <Route path="/patient/activity/culture-quest" element={<CultureQuest />} />
          <Route path="/patient/activity/recall-loop" element={<RecallLoop />} />
          <Route path="/patient/activity/family-puzzle" element={<FamilyPuzzle />} />

          {/* Doctor / Nurse Portal */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patient/:id" element={<PatientProfile />} />

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
