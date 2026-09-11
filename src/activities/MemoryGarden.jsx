import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function MemoryGarden() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const [stage, setStage] = useState('instructions'); // instructions -> observing -> question
  const [countdown, setCountdown] = useState(6);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const startTimeRef = useRef(null);

  // Garden items displayed
  const gardenItems = [
    { id: 1, name: 'Bright Red Rose', emoji: '🌹' },
    { id: 2, name: 'Two Sparrows', emoji: '🐦' },
    { id: 3, name: 'Emerald Watering Can', emoji: '🪴' },
    { id: 4, name: 'Golden Sunflower', emoji: '🌻' },
    { id: 5, name: 'Fragrant Jasmine', emoji: '🌼' }
  ];

  const questionData = patientDifficulty === 'Easy'
    ? {
        question: 'Which flower was blooming with bright red petals?',
        options: ['Bright Red Rose', 'Blue Lotus', 'White Lily', 'Purple Orchid'],
        correct: 'Bright Red Rose'
      }
    : patientDifficulty === 'Hard'
    ? {
        question: 'What color was the watering can placed beside the pots?',
        options: ['Emerald Green', 'Deep Sky Blue', 'Bright Yellow', 'Terracotta Red'],
        correct: 'Emerald Green'
      }
    : {
        question: 'How many singing sparrows were resting together in the garden?',
        options: ['Two Sparrows', 'One Lonely Sparrow', 'Four Sparrows', 'No Birds'],
        correct: 'Two Sparrows'
      };

  useEffect(() => {
    let timer;
    if (stage === 'observing') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        setStage('question');
        startTimeRef.current = Date.now();
      }
    }
    return () => clearTimeout(timer);
  }, [stage, countdown]);

  const handleStartObservation = () => {
    setCountdown(6);
    setStage('observing');
  };

  const handleSelectAnswer = (option) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswerChecked(true);

    const elapsedSeconds = startTimeRef.current
      ? Math.max(1.5, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10)
      : 4.0;

    const isCorrect = selectedAnswer === questionData.correct;
    const score = isCorrect ? 100 : 30;
    const accuracy = isCorrect ? 100 : 30;
    const mistakes = isCorrect ? 0 : 1;

    setTimeout(() => {
      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'memory-garden',
        activityName: 'Memory Garden',
        score,
        accuracy,
        correctAnswers: isCorrect ? 1 : 0,
        mistakes,
        responseTimeSec: elapsedSeconds,
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
      <div className="activity-host-container" role="main" aria-label="Memory Garden Activity">
        {/* Stage Header */}
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge">
              <Icon name="garden" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 1 of 10 • Visual Memory
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Memory Garden
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">Pace: {patientDifficulty}</span>
        </div>

        {/* STAGE 1: INSTRUCTIONS */}
        {stage === 'instructions' && (
          <div>
            <div className="instruction-callout">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {t.howToPlay}
              </h2>
              <p style={{ fontSize: '1rem', marginTop: '0.5rem', color: 'var(--color-text-body)' }}>
                Take a relaxed moment to observe the flowers and garden companions.
                You will have <strong>6 seconds</strong> to look at them before they rest.
                Then, you will answer a calm recall question about what was displayed.
              </p>
            </div>

            <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
              <button
                onClick={handleStartObservation}
                className="btn btn-primary btn-large"
              >
                <span>Start Observing (6 Seconds)</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: OBSERVING */}
        {stage === 'observing' && (
          <div>
            <div className="instruction-callout" style={{ borderLeftColor: 'var(--color-accent)', background: 'var(--color-accent-tint)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>
                  Observe carefully — Memory window is open
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-accent)' }}>
                  {countdown}s
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.25rem', margin: '2rem 0' }}>
              {gardenItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>{item.emoji}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: QUESTION & RECALL */}
        {stage === 'question' && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Recall Question
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                {questionData.question}
              </h2>
            </div>

            <div className="choice-grid choice-grid-2col">
              {questionData.options.map((option, idx) => {
                let statusClass = '';
                if (isAnswerChecked) {
                  if (option === questionData.correct) statusClass = 'correct';
                  else if (option === selectedAnswer) statusClass = 'incorrect';
                } else if (selectedAnswer === option) {
                  statusClass = 'selected';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    className={`choice-btn ${statusClass}`}
                    disabled={isAnswerChecked}
                    aria-label={`Option ${idx + 1}: ${option}`}
                  >
                    <span className="choice-key-badge">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isAnswerChecked}
                className="btn btn-primary btn-large"
              >
                <span>{isAnswerChecked ? 'Checking Answer...' : t.confirmAnswer}</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
