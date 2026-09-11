import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function LifeStory() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const questions = [
    {
      id: 1,
      theme: 'Festive Traditions',
      question: 'During the auspicious festival of Diwali, what is traditionally lit outside homes to guide blessings and prosperity?',
      options: [
        'Earthen Diyas (Clay Oil Lamps)',
        'Electric Flashlights',
        'Large Bonfires',
        'Paper Lanterns Only'
      ],
      correct: 'Earthen Diyas (Clay Oil Lamps)',
      eraMemory: 'The warm golden glow of terracotta lamps along the balcony.'
    },
    {
      id: 2,
      theme: 'Radio Days',
      question: 'Which nationwide radio service brought classic songs, cricket commentaries, and news into courtyards every evening?',
      options: [
        'Akashvani (All India Radio)',
        'Foreign Cable TV',
        'Internet Podcast',
        'Gramophone Record Store'
      ],
      correct: 'Akashvani (All India Radio)',
      eraMemory: 'Hearing the melodious signature flute tune of Akashvani at 6:00 AM.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersLog, setAnswersLog] = useState([]);
  const startTimeRef = useRef(Date.now());

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt) => {
    setSelectedAnswer(opt);
  };

  const handleNextOrFinish = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQ.correct;
    const updatedAnswers = [...answersLog, { qId: currentQ.id, isCorrect, answer: selectedAnswer }];
    setAnswersLog(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const totalSeconds = Math.max(3.5, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
      const correctCount = updatedAnswers.filter(a => a.isCorrect).length;
      const score = Math.round((correctCount / questions.length) * 100);
      const mistakes = questions.length - correctCount;

      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'lifestory',
        activityName: 'LifeStory',
        score,
        accuracy: score,
        correctAnswers: correctCount,
        mistakes,
        responseTimeSec: totalSeconds,
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
      <div className="activity-host-container" role="main" aria-label="LifeStory Reminiscence Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-indigo">
              <Icon name="story" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 3 of 10 • Question {currentIndex + 1} of {questions.length}
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                LifeStory
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">{currentQ.theme}</span>
        </div>

        {/* Nostalgic Prompt */}
        <div className="instruction-callout">
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
            Cherished Memory Recall
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
            {currentQ.question}
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            💭 {currentQ.eraMemory}
          </p>
        </div>

        {/* Options */}
        <div className="choice-grid">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`choice-btn ${selectedAnswer === opt ? 'selected' : ''}`}
            >
              <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {/* Next / Submit */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            onClick={handleNextOrFinish}
            disabled={!selectedAnswer}
            className="btn btn-primary btn-large"
          >
            <span>{currentIndex + 1 < questions.length ? "Next Memory Question" : "Complete LifeStory"}</span>
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
