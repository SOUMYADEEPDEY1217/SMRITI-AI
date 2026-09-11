import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function MemoryWalk() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const sequence = [
    { id: 'gate', name: 'Wooden Garden Gate', emoji: '🚪' },
    { id: 'pond', name: 'Lotus Pond', emoji: '🪷' },
    { id: 'tree', name: 'Ancient Banyan Tree', emoji: '🌳' },
    { id: 'bell', name: 'Sacred Temple Bell', emoji: '🔔' }
  ];

  const activeSequence = patientDifficulty === 'Easy' ? sequence.slice(0, 3) : sequence;

  const [phase, setPhase] = useState('observe'); // observe -> recall
  const [userSelection, setUserSelection] = useState([]);
  const startTimeRef = useRef(null);

  const handleStartWalk = () => {
    setPhase('recall');
    startTimeRef.current = Date.now();
  };

  const handleSelectLandmark = (item) => {
    if (userSelection.find(s => s.id === item.id)) return;
    setUserSelection(prev => [...prev, item]);
  };

  const handleResetSelection = () => {
    setUserSelection([]);
  };

  const handleCheckSequence = () => {
    const elapsed = startTimeRef.current
      ? Math.max(2.0, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10)
      : 4.5;

    let correctMatches = 0;
    for (let i = 0; i < activeSequence.length; i++) {
      if (userSelection[i]?.id === activeSequence[i].id) {
        correctMatches++;
      }
    }

    const score = Math.round((correctMatches / activeSequence.length) * 100);
    const mistakes = activeSequence.length - correctMatches;

    const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
      activityId: 'memory-walk',
      activityName: 'Memory Walk',
      score,
      accuracy: score,
      correctAnswers: correctMatches,
      mistakes,
      responseTimeSec: elapsed,
      difficulty: patientDifficulty
    });

    navigate('/patient/result', {
      state: {
        result: {
          ...session,
          difficultyChange: adaptiveDecision.change,
          feedbackNote: adaptiveDecision.message
        }
      }
    });
  };

  const selectableLandmarks = [
    { id: 'tree', name: 'Ancient Banyan Tree', emoji: '🌳' },
    { id: 'gate', name: 'Wooden Garden Gate', emoji: '🚪' },
    { id: 'bell', name: 'Sacred Temple Bell', emoji: '🔔' },
    { id: 'pond', name: 'Lotus Pond', emoji: '🪷' }
  ].filter(l => activeSequence.some(s => s.id === l.id));

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="activity-host-container" role="main" aria-label="Memory Walk Sequential Navigation">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-teal">
              <Icon name="walk" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 6 of 10 • Spatial Sequence
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Memory Walk
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">{activeSequence.length} Steps</span>
        </div>

        {/* PHASE 1: OBSERVE SEQUENCE */}
        {phase === 'observe' && (
          <div>
            <div className="instruction-callout">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Remember the sequence of stops on your morning walk:
              </h2>
              <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', color: 'var(--color-text-body)' }}>
                Observe the landmarks from left to right. When you feel comfortable, click <strong>"I Remember the Path"</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center', margin: '2.5rem 0' }}>
              {activeSequence.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    minWidth: '150px',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <span className="badge badge-neutral" style={{ marginBottom: '0.6rem' }}>
                    Stop {idx + 1}
                  </span>
                  <div style={{ fontSize: '2.8rem', margin: '0.4rem 0' }}>{item.emoji}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={handleStartWalk}
                className="btn btn-primary btn-large"
              >
                <span>I Remember the Path — Start Recall</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: RECALL SEQUENCE */}
        {phase === 'recall' && (
          <div>
            <div className="instruction-callout">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Select each stop in the exact order you visited them:
              </h2>
              <p style={{ marginTop: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Selected: {userSelection.length} of {activeSequence.length} stops
              </p>
            </div>

            {/* Current Chosen Order */}
            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                minHeight: '84px',
                background: 'var(--color-bg-surface)',
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                margin: '1.5rem 0',
                alignItems: 'center'
              }}
            >
              {userSelection.length === 0 ? (
                <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                  Click landmarks below in the order you visited them...
                </span>
              ) : (
                userSelection.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.5rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    <span className="badge badge-easy">#{idx + 1}</span>
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </div>
                ))
              )}
            </div>

            {/* Available Landmarks */}
            <div className="choice-grid choice-grid-2col">
              {selectableLandmarks.map((item) => {
                const isChosen = userSelection.some(s => s.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectLandmark(item)}
                    disabled={isChosen}
                    className={`choice-btn ${isChosen ? 'selected' : ''}`}
                    style={{ opacity: isChosen ? 0.45 : 1 }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{item.emoji}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleResetSelection}
                disabled={userSelection.length === 0}
                className="btn btn-secondary btn-large"
              >
                <span>Clear Order</span>
              </button>
              <button
                onClick={handleCheckSequence}
                disabled={userSelection.length < activeSequence.length}
                className="btn btn-primary btn-large"
              >
                <span>Submit Route Order</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
