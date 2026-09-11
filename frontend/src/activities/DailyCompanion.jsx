import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function DailyCompanion() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const actualDay = dayNames[today.getDay()];

  const dayChoices = [actualDay, 'Wednesday', 'Saturday', 'Monday'].filter((v, i, a) => a.indexOf(v) === i);
  while (dayChoices.length < 4) {
    for (const d of dayNames) {
      if (!dayChoices.includes(d)) dayChoices.push(d);
      if (dayChoices.length === 4) break;
    }
  }

  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [hydrated, setHydrated] = useState(null);
  const startTimeRef = useRef(Date.now());

  const handleFinishCompanion = () => {
    const elapsed = Math.max(2.5, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
    const dayCorrect = selectedDay === actualDay;
    const score = dayCorrect ? 100 : 75;

    const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
      activityId: 'daily-companion',
      activityName: 'Daily Companion',
      score,
      accuracy: dayCorrect ? 100 : 75,
      correctAnswers: dayCorrect ? 2 : 1,
      mistakes: dayCorrect ? 0 : 1,
      responseTimeSec: elapsed,
      difficulty: patientDifficulty
    });

    navigate('/patient/result', {
      state: {
        result: {
          ...session,
          difficultyChange: adaptiveDecision.change,
          feedbackNote: `Temporal orientation completed. ${dayCorrect ? "Accurate awareness of today's day!" : "Gentle reminder of today's day and wellness."}`
        }
      }
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="activity-host-container" role="main" aria-label="Daily Companion Orientation Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-accent">
              <Icon name="companion" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 5 of 10 • Step {step} of 3
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Daily Companion
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">Pace: {patientDifficulty}</span>
        </div>

        {/* STEP 1: DAY OF THE WEEK */}
        {step === 1 && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Orientation Check
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                Good morning! What day of the week is it today?
              </h2>
            </div>

            <div className="choice-grid choice-grid-2col">
              {dayChoices.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`choice-btn ${selectedDay === day ? 'selected' : ''}`}
                >
                  <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
                  <span>{day}</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedDay}
                className="btn btn-primary btn-large"
              >
                <span>Continue to Wellness Check</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FEELING & MOOD */}
        {step === 2 && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Mind & Body Check-In
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                How is your spirit feeling today?
              </h2>
            </div>

            <div className="choice-grid choice-grid-2col">
              {[
                { emoji: '😊', text: 'Peaceful and Happy' },
                { emoji: '☕', text: 'Calm and Relaxed' },
                { emoji: '💭', text: 'Thoughtful / Reminiscing' },
                { emoji: '🛋️', text: 'A little tired, resting well' }
              ].map((feeling, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFeeling(feeling.text)}
                  className={`choice-btn ${selectedFeeling === feeling.text ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '1.6rem' }}>{feeling.emoji}</span>
                  <span>{feeling.text}</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedFeeling}
                className="btn btn-primary btn-large"
              >
                <span>Proceed to Daily Hydration</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HYDRATION & REMINDER */}
        {step === 3 && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Hydration Routine
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                Did you have a refreshing cup of water or tea this morning?
              </h2>
              <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                Staying hydrated supports blood circulation and helps memory focus.
              </p>
            </div>

            <div className="choice-grid choice-grid-2col">
              {[
                'Yes, I had fresh water!',
                'I had warm tea / milk',
                'Not yet, I will drink right now'
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setHydrated(opt)}
                  className={`choice-btn ${hydrated === opt ? 'selected' : ''}`}
                >
                  <span className="choice-key-badge">💧</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={handleFinishCompanion}
                disabled={!hydrated}
                className="btn btn-primary btn-large"
              >
                <span>Complete Daily Companion</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
