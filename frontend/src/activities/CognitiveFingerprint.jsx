import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import RadarFingerprint from '../components/charts/RadarFingerprint';
import { getCurrentUser, getCognitiveDomains, getPatientSessions, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function CognitiveFingerprint() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientId = currentUser?.id || 'patient-1';
  const domains = getCognitiveDomains(patientId);
  const sessions = getPatientSessions(patientId);
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  // Aggregations
  const totalCompleted = sessions.length;
  const avgScore = totalCompleted > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalCompleted)
    : 85;
  const avgAccuracy = totalCompleted > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / totalCompleted)
    : 88;
  const avgResponseTime = totalCompleted > 0
    ? Math.round((sessions.reduce((acc, s) => acc + (s.responseTimeSec || 0), 0) / totalCompleted) * 10) / 10
    : 4.2;

  const currentDiff = currentUser?.difficulty || 'Medium';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="smriti-card" style={{ marginBottom: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div>
            <span className="badge-overline">Holistic Progress Profile</span>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-primary)', fontWeight: 800, marginTop: '0.3rem' }}>
              Your Cognitive Fingerprint
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Personal cognitive wellness summary for <strong>{currentUser?.name || 'Ramesh Patel'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <span className="badge badge-easy">Pace: {currentDiff}</span>
            <button onClick={() => navigate('/patient')} className="btn btn-secondary btn-small">
              <Icon name="home" size={16} />
              <span>{t.backToDashboard}</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="result-metric-tiles" style={{ margin: '1.75rem 0' }}>
          <div className="metric-tile-box">
            <div className="metric-tile-number">{avgScore}%</div>
            <div className="metric-tile-label">Average Score</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: 'var(--color-success)' }}>{avgAccuracy}%</div>
            <div className="metric-tile-label">Overall Accuracy</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: 'var(--color-teal)' }}>{totalCompleted}</div>
            <div className="metric-tile-label">Completed Sessions</div>
          </div>
          <div className="metric-tile-box">
            <div className="metric-tile-number" style={{ color: 'var(--color-accent)' }}>{avgResponseTime}s</div>
            <div className="metric-tile-label">Avg. Reaction Time</div>
          </div>
        </div>

        {/* Cognitive Radar Visualization */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', margin: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Multidimensional Cognitive Balance
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginTop: '0.3rem' }}>
              Shows relative balance across 8 cognitive domains without clinical diagnosis labels.
            </p>
          </div>

          <RadarFingerprint domainData={domains} height={380} />
        </div>

        {/* Domain Breakdown Cards */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '1.2rem' }}>
            Cognitive Domain Ratings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Visual Working Memory', val: domains?.visualMemory || 82, icon: 'garden' },
              { name: 'Face & Social Recognition', val: domains?.faceRecognition || 94, icon: 'face' },
              { name: 'Auditory Recall', val: domains?.auditoryMemory || 78, icon: 'radio' },
              { name: 'Daily Orientation', val: domains?.temporalOrientation || 88, icon: 'companion' },
              { name: 'Sequential Navigation', val: domains?.sequentialMemory || 72, icon: 'walk' },
              { name: 'Cultural Semantics', val: domains?.semanticKnowledge || 90, icon: 'culture' },
              { name: 'Delayed Retention', val: domains?.delayedRecall || 68, icon: 'loop' },
              { name: 'Visual Spatial Matching', val: domains?.patternMatching || 80, icon: 'puzzle' }
            ].map((d, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="icon-badge" style={{ width: '36px', height: '36px' }}>
                    <Icon name={d.icon} size={18} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                    {d.val}%
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.65rem' }}>{d.name}</div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.6rem' }}>
                  <div style={{ width: `${d.val}%`, height: '100%', background: 'var(--color-primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Session History Table */}
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '1.2rem' }}>
            Session History Log
          </h3>
          <div className="data-table-container">
            <table className="data-table" aria-label="Session History">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Mistakes</th>
                  <th>Reaction Time</th>
                  <th>Pacing Level</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(-6).reverse().map((s) => (
                  <tr key={s.sessionId}>
                    <td>{s.date}</td>
                    <td><strong>{s.activityName}</strong></td>
                    <td style={{ fontWeight: 800, color: s.score >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {s.score}%
                    </td>
                    <td>{s.accuracy}%</td>
                    <td>{s.mistakes}</td>
                    <td>{s.responseTimeSec}s</td>
                    <td><span className="badge badge-neutral">{s.difficulty}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button onClick={() => navigate('/patient')} className="btn btn-primary btn-large">
            <Icon name="home" size={18} />
            <span>{t.backToDashboard}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
