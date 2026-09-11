import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { loginUser, signupUser } from '../../data/api';
import { getSelectedLanguage, setSelectedLanguage } from '../../data/storage';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'
  const [username, setUsername] = useState('ramesh.patel');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [currentLang, setCurrentLang] = useState(getSelectedLanguage());
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'patient') {
      setUsername('ramesh.patel');
    } else if (role === 'doctor') {
      setUsername('dr.ananya');
    } else {
      setUsername('admin');
    }
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setCurrentLang(langId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await loginUser(username, password, selectedRole);
        if (res.success) {
          if (selectedRole === 'patient') navigate('/patient');
          else if (selectedRole === 'doctor') navigate('/doctor');
          else navigate('/admin');
        } else {
          setErrorMessage('Unable to authenticate. Please check your credentials.');
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        const res = await signupUser(fullName, username, password, selectedRole, currentLang);
        if (res.success) {
          if (selectedRole === 'patient') navigate('/patient');
          else if (selectedRole === 'doctor') navigate('/doctor');
          else navigate('/admin');
        }
      }
    } catch (err) {
      setErrorMessage('A connection error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    handleRoleSelect(role);
    setIsSubmitting(true);
    const demoUser = role === 'patient' ? 'ramesh.patel' : role === 'doctor' ? 'dr.ananya' : 'admin';
    await loginUser(demoUser, 'password123', role);
    if (role === 'patient') navigate('/patient');
    else if (role === 'doctor') navigate('/doctor');
    else navigate('/admin');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        {/* =============================================================
            LEFT PANEL: BRAND COMPOSITION (REFERENCE 2 INSPIRATION)
            ============================================================= */}
        <div className="auth-visual-panel">
          <div className="auth-visual-header">
            <Link to="/" className="auth-brand-badge" aria-label="Return to home">
              <span className="auth-accent-pip"></span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                Cognitive Care
              </span>
            </Link>

            <h2 className="auth-visual-quote">
              Memory support that feels <span>human.</span>
            </h2>
            <p className="auth-visual-sub">
              A peaceful digital space designed for dignified memory engagement, culturally familiar exercises, and supportive care coordination.
            </p>

            <div className="auth-features-preview">
              <div className="auth-feature-pill">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="garden" size={18} color="#ffffff" />
                </div>
                <div>
                  <div className="auth-feature-pill-title">10 Tailored Activities</div>
                  <div className="auth-feature-pill-sub">Visual recall, audio melodies, stories & routines</div>
                </div>
              </div>

              <div className="auth-feature-pill">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield-check" size={18} color="#ffffff" />
                </div>
                <div>
                  <div className="auth-feature-pill-title">Adaptive Pacing</div>
                  <div className="auth-feature-pill-sub">Automatically tunes challenge to comfort levels</div>
                </div>
              </div>

              <div className="auth-feature-pill">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="fingerprint" size={18} color="#ffffff" />
                </div>
                <div>
                  <div className="auth-feature-pill-title">Care Team Insight</div>
                  <div className="auth-feature-pill-sub">Objective progress tracking without patient stress</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()} Cognitive Care Platform. All rights reserved.
          </div>
        </div>

        {/* =============================================================
            RIGHT PANEL: FORM & ROLE SELECTION
            ============================================================= */}
        <div className="auth-form-panel">
          {/* Sign In vs Create Account Tabs */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-toggle-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {authMode === 'login' ? 'Welcome back' : 'Join Cognitive Care'}
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.25rem' }}>
              {authMode === 'login'
                ? 'Select your role to access your personalized portal.'
                : 'Create a new account tailored to your memory wellness needs.'}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="auth-role-grid">
            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'patient' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('patient')}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fee2e2', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="heart" size={16} color="#b91c1c" />
              </div>
              <div className="auth-role-card-label">Patient</div>
              <div className="auth-role-card-desc">Daily Exercises</div>
            </button>

            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'doctor' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('doctor')}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e0e7ff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield-check" size={16} color="#3730a3" />
              </div>
              <div className="auth-role-card-label">Care Team</div>
              <div className="auth-role-card-desc">Clinicians</div>
            </button>

            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="fingerprint" size={16} color="#b45309" />
              </div>
              <div className="auth-role-card-label">Admin</div>
              <div className="auth-role-card-desc">Management</div>
            </button>
          </div>

          {/* Patient Language Bar */}
          {selectedRole === 'patient' && (
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 800, marginBottom: '0.4rem' }}>
                Preferred Language
              </div>
              <div className="auth-lang-row">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    className={`auth-lang-btn ${currentLang === lang.id ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.id)}
                  >
                    <strong>{lang.nativeName}</strong> ({lang.label})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {errorMessage}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            {authMode === 'signup' && (
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="auth-text-input"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="username">
                {authMode === 'signup' ? 'Email / Identifier' : selectedRole === 'patient' ? 'Patient Name or ID' : 'Staff Email / Username'}
              </label>
              <input
                id="username"
                type="text"
                className="auth-text-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="auth-text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-black-pill"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {isSubmitting
                ? 'Processing...'
                : authMode === 'login'
                ? `Sign In as ${selectedRole === 'patient' ? 'Patient' : selectedRole === 'doctor' ? 'Care Team' : 'Administrator'}`
                : 'Create Account'}
              <Icon name="arrow-right" size={16} />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="auth-demo-row">
            <span className="auth-demo-title">1-Click Test Access:</span>
            <div className="auth-demo-buttons-group">
              <button type="button" onClick={() => handleQuickDemoLogin('patient')} className="auth-demo-btn">
                Ramesh Patel (Patient)
              </button>
              <button type="button" onClick={() => handleQuickDemoLogin('doctor')} className="auth-demo-btn">
                Dr. Ananya (Care Team)
              </button>
              <button type="button" onClick={() => handleQuickDemoLogin('admin')} className="auth-demo-btn">
                Administrator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
