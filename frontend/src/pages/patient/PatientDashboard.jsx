import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { getCurrentUser, getActivities, getPatientSessions, getSelectedLanguage } from '../../data/storage';
import { getTranslation } from '../../data/translations';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentLang, setCurrentLang] = useState(getSelectedLanguage());

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setActivities(getActivities());
    setSessions(getPatientSessions(user?.id || 'patient-1'));
    setCurrentLang(getSelectedLanguage());

    const handleLangChange = () => {
      setCurrentLang(getSelectedLanguage());
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const totalSessions = sessions.length;
  const recentSession = totalSessions > 0 ? sessions[sessions.length - 1] : null;
  const recentScore = recentSession ? recentSession.score : 88;
  const currentDiff = currentUser?.difficulty || 'Medium';

  const t = getTranslation(currentLang);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* -------------------------------------------------------------
          Patient Greeting & Engagement Banner
          ------------------------------------------------------------- */}
      <section className="patient-header-banner" aria-label="Welcome and daily summary">
        <div>
          <span className="badge-overline" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t.dailySummaryTitle}
          </span>
          <h1 className="patient-greeting-title">
            {t.welcomePrefix} {currentUser?.name || 'Ramesh Patel'}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-body)', marginTop: '0.4rem', maxWidth: '600px' }}>
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* High Contrast Engagement Strip */}
        <div className="patient-stats-strip" role="region" aria-label="Summary metrics">
          <div className="stat-item">
            <div className="stat-number">{totalSessions}</div>
            <div className="stat-label">{t.exercisesCompleted}</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--color-border)' }} />
          <div className="stat-item">
            <div className="stat-number" style={{ color: 'var(--color-success)' }}>{recentScore}%</div>
            <div className="stat-label">{t.recentScore}</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--color-border)' }} />
          <div className="stat-item">
            <div className="stat-number" style={{ color: 'var(--color-accent)' }}>{currentDiff}</div>
            <div className="stat-label">{t.adaptivePace}</div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          Quick Access: New Features
          ------------------------------------------------------------- */}
      <div className="quick-access-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="quick-access-card" onClick={() => navigate('/patient/memories')} role="button" tabIndex={0}>
          <div className="quick-access-icon" style={{ background: 'var(--color-primary-tint)' }}>📸</div>
          <div>
            <h3>Memories</h3>
            <p>Upload & browse your photo memories</p>
          </div>
          <Icon name="arrow-right" size={16} color="var(--color-text-muted)" />
        </div>
        <div className="quick-access-card" onClick={() => navigate('/patient/family')} role="button" tabIndex={0}>
          <div className="quick-access-icon" style={{ background: 'var(--color-accent-tint)' }}>👨‍👩‍👧‍👦</div>
          <div>
            <h3>Family</h3>
            <p>Enroll & recognize family faces</p>
          </div>
          <Icon name="arrow-right" size={16} color="var(--color-text-muted)" />
        </div>
        <div className="quick-access-card" onClick={() => navigate('/patient/reminders')} role="button" tabIndex={0}>
          <div className="quick-access-icon" style={{ background: 'var(--color-teal-tint)' }}>⏰</div>
          <div>
            <h3>Reminders</h3>
            <p>Medication, appointments & routines</p>
          </div>
          <Icon name="arrow-right" size={16} color="var(--color-text-muted)" />
        </div>
        <div className="quick-access-card" onClick={() => navigate('/patient/quiz')} role="button" tabIndex={0}>
          <div className="quick-access-icon" style={{ background: 'var(--color-indigo-tint)' }}>🧩</div>
          <div>
            <h3>Memory Quiz</h3>
            <p>AI-generated recall questions</p>
          </div>
          <Icon name="arrow-right" size={16} color="var(--color-text-muted)" />
        </div>
      </div>

      {/* -------------------------------------------------------------
          Section Title & Cognitive Fingerprint Shortcut
          ------------------------------------------------------------- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-title)' }}>
            {t.chooseActivity}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
            {t.chooseActivityDesc}
          </p>
        </div>

        <button
          onClick={() => navigate('/patient/fingerprint')}
          className="btn btn-secondary"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          <Icon name="fingerprint" size={18} color="var(--color-primary)" />
          <span>{t.viewFingerprint}</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          10 Activities Grid
          ------------------------------------------------------------- */}
      <div className="activities-grid" role="list" aria-label="10 Cognitive Activities">
        {activities.map((act, index) => {
          const routeMap = {
            'memory-garden': '/patient/activity/memory-garden',
            'familiar-face': '/patient/activity/familiar-face',
            'lifestory': '/patient/activity/lifestory',
            'memory-radio': '/patient/activity/memory-radio',
            'daily-companion': '/patient/activity/daily-companion',
            'memory-walk': '/patient/activity/memory-walk',
            'culture-quest': '/patient/activity/culture-quest',
            'recall-loop': '/patient/activity/recall-loop',
            'family-puzzle': '/patient/activity/family-puzzle',
            'cognitive-fingerprint': '/patient/fingerprint'
          };

          const iconMap = {
            'memory-garden': 'garden',
            'familiar-face': 'face',
            'lifestory': 'story',
            'memory-radio': 'radio',
            'daily-companion': 'companion',
            'memory-walk': 'walk',
            'culture-quest': 'culture',
            'recall-loop': 'loop',
            'family-puzzle': 'puzzle',
            'cognitive-fingerprint': 'fingerprint'
          };

          const targetUrl = routeMap[act.id] || `/patient/activity/${act.id}`;
          const localized = t.activities[act.id] || {
            title: act.title,
            category: act.category,
            desc: act.description
          };

          return (
            <Link
              to={targetUrl}
              key={act.id}
              className="activity-card"
              role="listitem"
              aria-label={`Activity ${index + 1}: ${localized.title}. ${localized.category}`}
            >
              <div>
                <div className="activity-card-header">
                  <div className="icon-badge">
                    <Icon name={iconMap[act.id] || 'heart'} size={22} />
                  </div>
                  <span className="badge badge-neutral">{localized.category}</span>
                </div>

                <h3 className="activity-card-title">
                  {index + 1}. {localized.title}
                </h3>
                <p className="activity-card-desc">
                  {localized.desc}
                </p>
              </div>

              <div className="activity-card-footer">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon name="clock" size={15} color="var(--color-text-muted)" />
                  {act.estimatedTime || '3 mins'}
                </span>
                <span className="activity-card-action">
                  <span>{t.startExercise}</span>
                  <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* -------------------------------------------------------------
          Recent Practice Summary
          ------------------------------------------------------------- */}
      {recentSession && (
        <section style={{ marginTop: '3rem' }}>
          <div className="smriti-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <span className="badge-overline">Most Recent Session</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.3rem' }}>
                Completed <strong>{recentSession.activityName}</strong> on {recentSession.date}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                Score: {recentSession.score}% • Reaction Time: {recentSession.responseTimeSec}s • {recentSession.feedbackNote}
              </p>
            </div>
            <button onClick={() => navigate('/patient/fingerprint')} className="btn btn-secondary">
              View Detailed History
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
