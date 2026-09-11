import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function FamiliarFace() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const startTimeRef = useRef(Date.now());

  const photoSubject = {
    name: 'Granddaughter Priya',
    relation: 'Eldest Granddaughter (Graduated in Engineering)',
    question: 'Who is this smiling young lady in the graduation photograph?',
    options: [
      'Granddaughter Priya',
      'Neighbor Sunita',
      'School Teacher Meera',
      'College Friend Anita'
    ],
    correct: 'Granddaughter Priya',
    hint: 'She visited you last Sunday and brought warm cardamom sweets.'
  };

  const handleSelectAnswer = (option) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const elapsed = Math.max(1.8, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
    const isCorrect = selectedAnswer === photoSubject.correct;
    const score = isCorrect ? 100 : 40;
    const accuracy = isCorrect ? 100 : 40;

    setTimeout(() => {
      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'familiar-face',
        activityName: 'Familiar Face',
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
      <div className="activity-host-container" role="main" aria-label="Familiar Face Recognition Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-teal">
              <Icon name="face" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 2 of 10 • Social Recognition
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Familiar Face
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">Pace: {patientDifficulty}</span>
        </div>

        {/* Photo Display Card */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '240px',
              height: '240px',
              margin: '0 auto',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '3px solid var(--color-primary-tint)',
              boxShadow: 'var(--shadow-card)',
              background: 'linear-gradient(135deg, #eaf4f4 0%, #d8ecec 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <svg viewBox="0 0 200 200" width="170" height="170" aria-label="Granddaughter Priya Portrait">
              <circle cx="100" cy="85" r="45" fill="#fbcfe8" />
              <path d="M55,180 C55,130 145,130 145,180 Z" fill="#0f766e" />
              <path d="M55,80 C55,40 145,40 145,80 C145,95 135,115 135,115 C135,115 125,75 100,75 C75,75 65,115 65,115 Z" fill="#1e293b" />
              <circle cx="85" cy="85" r="5" fill="#1e293b" />
              <circle cx="115" cy="85" r="5" fill="#1e293b" />
              <path d="M88,105 Q100,118 112,105" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <polygon points="100,20 155,42 100,64 45,42" fill="#1e1b4b" />
              <rect x="75" y="42" width="50" height="22" fill="#1e1b4b" />
              <line x1="145" y1="45" x2="155" y2="70" stroke="#f59e0b" strokeWidth="3" />
            </svg>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
            Gentle Clue: {photoSubject.hint}
          </p>
        </div>

        {/* Question Prompt */}
        <div className="instruction-callout">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {photoSubject.question}
          </h2>
        </div>

        {/* Choices */}
        <div className="choice-grid choice-grid-2col">
          {photoSubject.options.map((option, idx) => {
            let statusClass = '';
            if (isAnswerChecked) {
              if (option === photoSubject.correct) statusClass = 'correct';
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
              >
                <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isAnswerChecked}
            className="btn btn-primary btn-large"
          >
            <span>{isAnswerChecked ? 'Verifying...' : t.confirmAnswer}</span>
            <Icon name="check" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
