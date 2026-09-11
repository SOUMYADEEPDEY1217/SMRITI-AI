import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';
import { getAudioTrackUrl } from '../utils/audioSynthesizer';

export default function MemoryRadio() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(14);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const startTimeRef = useRef(null);

  const audioSrc = getAudioTrackUrl('audio-1');

  const questionData = {
    question: 'Which traditional instrument led the gentle melody you just heard on the radio?',
    options: [
      'Acoustic Bamboo Flute (Bansuri)',
      'Electric Rock Guitar',
      'Heavy Brass Trumpet',
      'Loud Electronic Synth'
    ],
    correct: 'Acoustic Bamboo Flute (Bansuri)',
    explanation: 'The melody was softly played on a bamboo flute, accompanied by tanpura drones.'
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasListened(true);
      }).catch(err => {
        console.warn('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowQuestion(true);
    startTimeRef.current = Date.now();
  };

  const handleProceedToQuestion = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setShowQuestion(true);
    startTimeRef.current = Date.now();
  };

  const handleSelectAnswer = (opt) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const elapsed = startTimeRef.current
      ? Math.max(1.5, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10)
      : 3.5;

    const isCorrect = selectedAnswer === questionData.correct;
    const score = isCorrect ? 100 : 35;
    const accuracy = isCorrect ? 100 : 35;

    setTimeout(() => {
      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'memory-radio',
        activityName: 'Memory Radio',
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
      <div className="activity-host-container" role="main" aria-label="Memory Radio Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-accent">
              <Icon name="radio" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 4 of 10 • Auditory Recall
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Memory Radio
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">Pace: {patientDifficulty}</span>
        </div>

        {/* Vintage Radio Console with HTML5 Audio */}
        <div className="radio-chassis">
          <div className="radio-speaker-grille">
            <div className="speaker-line" style={{ height: isPlaying ? '35px' : '15px' }} />
            <div className="speaker-line" style={{ height: isPlaying ? '48px' : '22px' }} />
            <div className="speaker-line" style={{ height: isPlaying ? '28px' : '18px' }} />
            <div className="speaker-line" style={{ height: isPlaying ? '44px' : '20px' }} />
            <div className="speaker-line" style={{ height: isPlaying ? '30px' : '15px' }} />
          </div>

          <div className="radio-display">
            {isPlaying ? '♪ PLAYING: RAGA BHAUPALI 800 AM ♪' : 'SMRITI RADIO • AM 800 KHZ'}
          </div>

          <audio
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            preload="auto"
          />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={togglePlay}
              className="btn btn-large"
              style={{
                borderRadius: 'var(--radius-full)',
                backgroundColor: isPlaying ? '#dc2626' : 'var(--color-primary)',
                color: '#ffffff'
              }}
            >
              <span>{isPlaying ? '⏸️ Pause Melody' : '▶️ Play Soothing Melody'}</span>
            </button>

            {hasListened && !showQuestion && (
              <button
                onClick={handleProceedToQuestion}
                className="btn btn-secondary btn-large"
                style={{ backgroundColor: '#ffffff', color: '#78350f' }}
              >
                <span>Ready for Question</span>
                <Icon name="arrow-right" size={18} />
              </button>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', opacity: 0.85 }}>
            Time: {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </div>
        </div>

        {/* Question Phase */}
        {showQuestion && (
          <div>
            <div className="instruction-callout">
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 800 }}>
                Auditory Recall Question
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
                {questionData.question}
              </h2>
            </div>

            <div className="choice-grid choice-grid-2col">
              {questionData.options.map((opt, idx) => {
                let statusClass = '';
                if (isAnswerChecked) {
                  if (opt === questionData.correct) statusClass = 'correct';
                  else if (opt === selectedAnswer) statusClass = 'incorrect';
                } else if (selectedAnswer === opt) {
                  statusClass = 'selected';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`choice-btn ${statusClass}`}
                    disabled={isAnswerChecked}
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
                disabled={!selectedAnswer || isAnswerChecked}
                className="btn btn-primary btn-large"
              >
                <span>{isAnswerChecked ? 'Verifying Melody...' : t.confirmAnswer}</span>
                <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
