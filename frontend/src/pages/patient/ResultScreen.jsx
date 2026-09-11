import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { getSelectedLanguage } from '../../data/storage';
import { getTranslation } from '../../data/translations';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  if (!result) {
    return (
      <div className="container text-center" style={{ padding: '4rem 1.5rem' }}>
        <h2>No recent session results found.</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
          Please select an activity from your dashboard to begin.
        </p>
        <Link to="/patient" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          {t.backToDashboard}
        </Link>
      </div>
    );
  }

  const {
    activityName = 'Cognitive Activity',
    score = 100,
    accuracy = 100,
    correctAnswers = 1,
    mistakes = 0,
    responseTimeSec = 4.0,
    difficulty = 'Medium',
    newDifficulty = 'Medium',
    difficultyChange = 'same',
    feedbackNote = 'Great practice session!'
  } = result;

  const isMastery = score >= 80;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="result-card-clean" role="region" aria-label="Activity Result Summary">
        <div style={{ display: 'inline-flex', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-tint)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', alignItems: 'center', gap: '0.4rem' }}>
          <Icon name="check" size={16} />
          <span>Session Complete</span>
        </div>

        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
          {isMastery ? 'Wonderful Memory Work!' : 'Well Done for Practicing!'}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
          You have completed <strong>{activityName}</strong>
        </p>

        {/* Score Ring */}
        <div className="result-ring" aria-label={`Score: ${score} percent`}>
          <div className="result-ring-val">{score}%</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.score}
          </div>
        </div>

        {/* Metric Tiles */}
        <div className="result-metric-tiles">
          <div className="metric-tile-box">
            <div className="metric-tile-number">{accuracy}%</div>
            <div className="metric-tile-label">{t.accuracy}</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: 'var(--color-success)' }}>
              {correctAnswers}
            </div>
            <div className="metric-tile-label">Correct</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: mistakes > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {mistakes}
            </div>
            <div className="metric-tile-label">{t.mistakes}</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: 'var(--color-accent)' }}>
              {responseTimeSec}s
            </div>
            <div className="metric-tile-label">{t.responseTime}</div>
          </div>
        </div>

        {/* Adaptive Pacing Feedback Box */}
        <div
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            margin: '2rem 0',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <div className="icon-badge icon-badge-accent" style={{ marginTop: '0.2rem' }}>
            <Icon name="trending-up" size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
                {t.adaptiveNotice}
              </span>
              <span className="badge badge-neutral">Current: {difficulty}</span>
              <span>➔</span>
              <span className="badge badge-easy">Next Session: {newDifficulty}</span>
            </div>
            <p style={{ marginTop: '0.45rem', fontSize: '0.95rem', color: 'var(--color-text-body)' }}>
              {feedbackNote}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
          <button
            onClick={() => navigate('/patient')}
            className="btn btn-primary btn-large"
          >
            <Icon name="home" size={18} />
            <span>{t.backToDashboard}</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-large"
          >
            <Icon name="loop" size={18} />
            <span>{t.replayActivity}</span>
          </button>
          <button
            onClick={() => navigate('/patient/fingerprint')}
            className="btn btn-secondary btn-large"
          >
            <Icon name="fingerprint" size={18} />
            <span>{t.viewFingerprint}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
