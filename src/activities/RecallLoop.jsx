import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function RecallLoop() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const memorySet = ['Sacred River', 'Golden Temple Bell', 'Fragrant Saffron'];

  const [phase, setPhase] = useState('memorize'); // memorize -> delay -> recall
  const [delayCountdown, setDelayCountdown] = useState(5);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const startTimeRef = useRef(null);

  const recallOptions = [
    'Golden Temple Bell',
    'Diamond Necklace',
    'Wooden Boat',
    'Green Meadow'
  ];
  const correctWord = 'Golden Temple Bell';

  useEffect(() => {
    let timer;
    if (phase === 'delay') {
      if (delayCountdown > 0) {
        timer = setTimeout(() => setDelayCountdown(prev => prev - 1), 1000);
      } else {
        setPhase('recall');
        startTimeRef.current = Date.now();
      }
    }
    return () => clearTimeout(timer);
  }, [phase, delayCountdown]);

  const handleStartDelay = () => {
    setDelayCountdown(5);
    setPhase('delay');
  };

  const handleSelectWord = (word) => {
    if (isAnswerChecked) return;
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (!selectedWord || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const elapsed = startTimeRef.current
      ? Math.max(1.5, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10)
      : 3.8;

    const isCorrect = selectedWord === correctWord;
    const score = isCorrect ? 100 : 35;
    const accuracy = isCorrect ? 100 : 35;

    setTimeout(() => {
      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'recall-loop',
        activityName: 'Recall Loop',
        score,
        accuracy,
        correctAnswers: isCorrect ? 1 : 0,
        mistakes: isCorrect ? 0 : 1,
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
    }, 1100);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="activity-host-container" role="main" aria-label="Recall Loop Delayed Retention Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-indigo">
              <Icon name="loop" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 8 of 10 • Delayed Retention
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Recall Loop
              </h1>
            </div>
          </div>
          <span className="badge badge-hard">Pace: {patientDifficulty}</span>
        </div>

        {/* PHASE 1: MEMORIZE */}
        {phase === 'memorize' && (
          <div>
            <div className="instruction-callout">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Commit these 3 special words to memory:
              </h2>
              <p style={{ marginTop: '0.4rem', color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
                Read them calmly. When ready, we will take a gentle breathing pause before recalling.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', margin: '2.5rem 0' }}>
              {memorySet.map((word, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-indigo-tint)',
                    border: '1.5px solid var(--color-indigo)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.4rem 2rem',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--color-indigo)',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  {word}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={handleStartDelay}
                className="btn btn-primary btn-large"
              >
                <span>I Have Memorized — Begin Calm Pause</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: DELAY WITH CALM BREATHING */}
        {phase === 'delay' && (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontWeight: 800 }}>
              Breathe Gently... Holding in Memory
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: '0.8rem 0' }}>
              Take a slow, peaceful breath in and out.
            </p>

            <div
              style={{
                width: '120px',
                height: '120px',
                margin: '2rem auto',
                borderRadius: '50%',
                background: 'var(--color-primary-tint)',
                border: '5px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--color-primary)'
              }}
            >
              {delayCountdown}
            </div>
          </div>
        )}

        {/* PHASE 3: RECALL QUESTION */}
        {phase === 'recall' && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Delayed Retrieval Question
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                Which item from the options below was in the 3 words you memorized?
              </h2>
            </div>

            <div className="choice-grid choice-grid-2col">
              {recallOptions.map((opt, idx) => {
                let statusClass = '';
                if (isAnswerChecked) {
                  if (opt === correctWord) statusClass = 'correct';
                  else if (opt === selectedWord) statusClass = 'incorrect';
                } else if (selectedWord === opt) {
                  statusClass = 'selected';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectWord(opt)}
                    disabled={isAnswerChecked}
                    className={`choice-btn ${statusClass}`}
                  >
                    <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!selectedWord || isAnswerChecked}
                className="btn btn-primary btn-large"
              >
                <span>{isAnswerChecked ? 'Verifying Recall...' : t.confirmAnswer}</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
