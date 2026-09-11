import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function CultureQuest() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const cultureQuestions = [
    {
      id: 1,
      topic: 'Festivals of Joy',
      prompt: 'Which vibrant spring festival is celebrated with joyfully splashing colors, sharing gujiya sweets, and embracing friends?',
      options: ['Holi', 'Diwali', 'Ganesh Chaturthi', 'Makar Sankranti'],
      correct: 'Holi',
      explanation: 'Holi, the festival of colors, welcomes the warmth and vibrant blossoms of spring.'
    },
    {
      id: 2,
      topic: 'Monuments of Heritage',
      prompt: 'Which world-famous ivory-white marble mausoleum sits gracefully on the bank of the Yamuna River in Agra?',
      options: ['Taj Mahal', 'Red Fort', 'Qutub Minar', 'Hawa Mahal'],
      correct: 'Taj Mahal',
      explanation: 'The Taj Mahal is an architectural wonder celebrated across the world.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [sessionLog, setSessionLog] = useState([]);
  const startTimeRef = useRef(Date.now());

  const currentQ = cultureQuestions[currentIndex];

  const handleSelectOption = (opt) => {
    if (isValidated) return;
    setSelectedOption(opt);
  };

  const handleValidateAnswer = () => {
    if (!selectedOption || isValidated) return;
    setIsValidated(true);
  };

  const handleNextOrFinish = () => {
    const isCorrect = selectedOption === currentQ.correct;
    const updated = [...sessionLog, { isCorrect }];
    setSessionLog(updated);

    if (currentIndex + 1 < cultureQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsValidated(false);
    } else {
      const elapsed = Math.max(3.0, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
      const correctCount = updated.filter(u => u.isCorrect).length;
      const score = Math.round((correctCount / cultureQuestions.length) * 100);
      const mistakes = cultureQuestions.length - correctCount;

      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'culture-quest',
        activityName: 'Culture Quest',
        score,
        accuracy: score,
        correctAnswers: correctCount,
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
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="activity-host-container" role="main" aria-label="Culture Quest Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-accent">
              <Icon name="culture" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 7 of 10 • Question {currentIndex + 1} of {cultureQuestions.length}
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Culture Quest
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">{currentQ.topic}</span>
        </div>

        {/* Question Prompt */}
        <div className="instruction-callout">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {currentQ.prompt}
          </h2>
        </div>

        {/* Options */}
        <div className="choice-grid choice-grid-2col">
          {currentQ.options.map((opt, idx) => {
            let statusClass = '';
            if (isValidated) {
              if (opt === currentQ.correct) statusClass = 'correct';
              else if (opt === selectedOption) statusClass = 'incorrect';
            } else if (selectedOption === opt) {
              statusClass = 'selected';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isValidated}
                className={`choice-btn ${statusClass}`}
              >
                <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Explanation */}
        {isValidated && (
          <div
            style={{
              background: selectedOption === currentQ.correct ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              border: `1.5px solid ${selectedOption === currentQ.correct ? 'var(--color-success)' : 'var(--color-danger)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              margin: '1.5rem 0'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: selectedOption === currentQ.correct ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {selectedOption === currentQ.correct ? '✨ Correct!' : '🌿 Note:'}
            </div>
            <p style={{ marginTop: '0.35rem', color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          {!isValidated ? (
            <button
              onClick={handleValidateAnswer}
              disabled={!selectedOption}
              className="btn btn-primary btn-large"
            >
              <span>Validate Answer</span>
              <Icon name="check" size={18} />
            </button>
          ) : (
            <button
              onClick={handleNextOrFinish}
              className="btn btn-primary btn-large"
            >
              <span>{currentIndex + 1 < cultureQuestions.length ? "Next Heritage Question" : "Complete Culture Quest"}</span>
              <Icon name="arrow-right" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
