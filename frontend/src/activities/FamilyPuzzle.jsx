import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icons';
import { getCurrentUser, saveActivityResult, getSelectedLanguage } from '../data/storage';
import { getTranslation } from '../data/translations';

export default function FamilyPuzzle() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const patientDifficulty = currentUser?.difficulty || 'Medium';
  const currentLang = getSelectedLanguage();
  const t = getTranslation(currentLang);

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const startTimeRef = useRef(Date.now());

  const puzzlePieces = [
    {
      id: 'piece-1',
      title: 'Tile A: Golden Sunlight & Teacup',
      pattern: '☕ Saucer with Porcelain Teacup',
      isCorrect: true,
      color: '#fef3c7'
    },
    {
      id: 'piece-2',
      title: 'Tile B: Gray Stone Patch',
      pattern: '🪨 River Cobblestone',
      isCorrect: false,
      color: '#f3f4f6'
    },
    {
      id: 'piece-3',
      title: 'Tile C: Empty Night Sky',
      pattern: '🌌 Dark Starless Night',
      isCorrect: false,
      color: '#e0e7ff'
    },
    {
      id: 'piece-4',
      title: 'Tile D: Desert Sand Ripple',
      pattern: '🏜️ Dry Sand Dunes',
      isCorrect: false,
      color: '#ffedd5'
    }
  ];

  const handleSelectPiece = (piece) => {
    if (isAnswerChecked) return;
    setSelectedPiece(piece);
  };

  const handleSubmit = () => {
    if (!selectedPiece || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const elapsed = Math.max(1.8, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
    const isCorrect = selectedPiece.isCorrect;
    const score = isCorrect ? 100 : 40;
    const accuracy = isCorrect ? 100 : 40;

    setTimeout(() => {
      const { session, adaptiveDecision } = saveActivityResult(currentUser.id, {
        activityId: 'family-puzzle',
        activityName: 'Family Puzzle',
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
      <div className="activity-host-container" role="main" aria-label="Family Puzzle Pattern Matching Activity">
        <div className="activity-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="icon-badge icon-badge-teal">
              <Icon name="puzzle" size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Activity 9 of 10 • Pattern Matching
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
                Family Puzzle
              </h1>
            </div>
          </div>
          <span className="badge badge-easy">Pace: {patientDifficulty}</span>
        </div>

        {/* Puzzle Board with Missing Quadrant */}
        <div style={{ textAlign: 'center', margin: '1rem 0 2rem' }}>
          <div
            style={{
              maxWidth: '340px',
              height: '220px',
              margin: '0 auto',
              border: '3px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              background: '#ffffff'
            }}
          >
            <div style={{ background: '#eaf4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #d0d5dd', borderBottom: '1px solid #d0d5dd' }}>
              <span style={{ fontSize: '2.5rem' }}>🌳</span>
            </div>
            <div style={{ background: '#fcf1ea', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #d0d5dd' }}>
              <span style={{ fontSize: '2.5rem' }}>☀️</span>
            </div>
            <div style={{ background: '#ecf1f8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #d0d5dd' }}>
              <span style={{ fontSize: '2.5rem' }}>🧺</span>
            </div>
            <div
              style={{
                background: selectedPiece ? selectedPiece.color : 'var(--color-bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed var(--color-accent)'
              }}
            >
              {selectedPiece ? (
                <span style={{ fontSize: '2rem' }}>{selectedPiece.pattern.split(' ')[0]}</span>
              ) : (
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-accent)' }}>Missing Tile</span>
              )}
            </div>
          </div>
          <p style={{ marginTop: '0.8rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
            Scene: Sunday Garden Tea under the Banyan Tree. Which piece completes the gathering?
          </p>
        </div>

        {/* Prompt */}
        <div className="instruction-callout">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Choose the keepsake tile that belongs in the missing spot:
          </h2>
        </div>

        {/* Options */}
        <div className="choice-grid choice-grid-2col">
          {puzzlePieces.map((piece, idx) => {
            let statusClass = '';
            if (isAnswerChecked) {
              if (piece.isCorrect) statusClass = 'correct';
              else if (selectedPiece?.id === piece.id) statusClass = 'incorrect';
            } else if (selectedPiece?.id === piece.id) {
              statusClass = 'selected';
            }

            return (
              <button
                key={piece.id}
                onClick={() => handleSelectPiece(piece)}
                disabled={isAnswerChecked}
                className={`choice-btn ${statusClass}`}
              >
                <span className="choice-key-badge">{String.fromCharCode(65 + idx)}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{piece.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{piece.pattern}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            onClick={handleSubmit}
            disabled={!selectedPiece || isAnswerChecked}
            className="btn btn-primary btn-large"
          >
            <span>{isAnswerChecked ? 'Fitting Piece...' : 'Place Puzzle Piece'}</span>
            <Icon name="check" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
