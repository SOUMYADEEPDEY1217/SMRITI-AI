import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { generateQuiz, generateSequenceQuiz, submitQuizAnswer, getWeakMemories, listMemories } from '../../data/api';
import { getCurrentUser } from '../../data/storage';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const preselectedMemory = searchParams.get('memory');
  const currentUser = getCurrentUser();

  const [tab, setTab] = useState('select'); // select | playing | result | sequence | weak
  const [memories, setMemories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [weakMemories, setWeakMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMemoryId, setSelectedMemoryId] = useState(preselectedMemory || '');
  const [difficulty, setDifficulty] = useState((currentUser?.difficulty || 'medium').toLowerCase());

  // Sequence quiz state
  const [seqQuestion, setSeqQuestion] = useState(null);
  const [seqOrder, setSeqOrder] = useState([]);
  const [seqResult, setSeqResult] = useState(null);

  const startTimeRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [mems, weak] = await Promise.all([listMemories(), getWeakMemories()]);
    setMemories(Array.isArray(mems) ? mems : []);
    setWeakMemories(Array.isArray(weak) ? weak : []);
    setLoading(false);

    if (preselectedMemory) {
      startQuiz(preselectedMemory);
    }
  }

  async function startQuiz(memoryId) {
    setLoading(true);
    setError('');
    setResults([]);
    setAnswers({});
    setCurrentQ(0);

    const result = await generateQuiz(memoryId || selectedMemoryId, difficulty);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (!result.questions || result.questions.length === 0) {
      setError('No questions could be generated for this memory.');
      setLoading(false);
      return;
    }
    setQuestions(result.questions);
    setTab('playing');
    startTimeRef.current = Date.now();
    setLoading(false);
  }

  async function handleAnswer(answer) {
    const q = questions[currentQ];
    const responseTime = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);

    setAnswers(prev => ({ ...prev, [q.question_id]: answer }));
    setLoading(true);

    const result = await submitQuizAnswer(q.question_id, answer, parseFloat(responseTime), difficulty);
    setResults(prev => [...prev, { question: q, answer, ...result }]);

    if (result.next_difficulty) {
      setDifficulty(result.next_difficulty.toLowerCase());
    }

    setLoading(false);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      startTimeRef.current = Date.now();
    } else {
      setTab('result');
    }
  }

  async function startSequenceQuiz() {
    setLoading(true);
    setError('');
    setSeqResult(null);
    const result = await generateSequenceQuiz(5);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSeqQuestion(result);
    setSeqOrder(result.items || []);
    setTab('sequence');
    setLoading(false);
  }

  function moveItem(index, direction) {
    const newOrder = [...seqOrder];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
    setSeqOrder(newOrder);
  }

  async function submitSequence() {
    if (!seqQuestion) return;
    setLoading(true);
    const responseTime = 10;
    const result = await submitQuizAnswer(seqQuestion.question_id, seqOrder.join(','), responseTime, difficulty);
    setSeqResult(result);
    setLoading(false);
  }

  const correctCount = results.filter(r => r.correct).length;
  const totalCount = results.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  function getMemoryLabel(memId) {
    const m = memories.find(x => (x._id || x.memory_id) === memId);
    return m ? (m.scene || m.activity || 'Memory') : memId;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <section className="patient-header-banner" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge-overline">Cognitive Exercise</span>
          <h1 className="patient-greeting-title">Memory Quiz</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-body)', marginTop: '0.4rem', maxWidth: '600px' }}>
            Test your recall on saved memories. AI generates personalized questions that adapt to your pace.
          </p>
        </div>
      </section>

      {error && <div className="alert-banner alert-danger"><Icon name="heart" size={16} /> {error}</div>}

      {/* SELECT MEMORY */}
      {tab === 'select' && (
        <div>
          <div className="memories-tab-bar" style={{ marginBottom: '1.5rem' }}>
            <button className="memories-tab active"><Icon name="puzzle" size={18} /> Memory Quiz</button>
            <button className="memories-tab" onClick={startSequenceQuiz}>
              <Icon name="walk" size={18} /> Sequence Challenge
            </button>
            <button className="memories-tab" onClick={() => setTab('weak')}>
              <Icon name="loop" size={18} /> Weak Areas ({weakMemories.length})
            </button>
          </div>

          <div className="smriti-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Choose a Memory to Quiz On
            </h2>

            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select className="form-input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="easy">Easy — Gentle & Supportive</option>
                <option value="medium">Medium — Balanced Challenge</option>
                <option value="hard">Hard — Deep Recall</option>
              </select>
            </div>

            {memories.length === 0 && !loading && (
              <div className="empty-state-card">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                <p>No memories saved yet. Upload photos in the <strong>Memories</strong> section first.</p>
              </div>
            )}

            <div className="quiz-memory-list">
              {memories.map((m, i) => {
                const memId = m._id || m.memory_id;
                return (
                  <div key={memId || i} className={`quiz-memory-item ${selectedMemoryId === memId ? 'selected' : ''}`}
                    onClick={() => setSelectedMemoryId(memId)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.photo_url && <img src={m.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />}
                      <div>
                        <h4 style={{ fontWeight: 600 }}>{m.scene || m.activity || 'Untitled'}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {(m.people || []).join(', ') || 'No people tagged'} {m.location ? `• ${m.location}` : ''}
                        </p>
                      </div>
                    </div>
                    {selectedMemoryId === memId && <Icon name="heart" size={16} color="var(--color-primary)" />}
                  </div>
                );
              })}
            </div>

            {selectedMemoryId && (
              <button className="btn btn-primary" onClick={() => startQuiz(selectedMemoryId)} disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
                {loading ? <><span className="spinner" /> Generating Quiz...</> : <><Icon name="puzzle" size={16} /> Start Quiz</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* PLAYING */}
      {tab === 'playing' && questions.length > 0 && (
        <div className="quiz-playing-section">
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Question {currentQ + 1} of {questions.length}
            <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>{questions[currentQ].activity_type}</span>
          </p>

          <div className="smriti-card quiz-question-card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4 }}>
              {questions[currentQ].question}
            </h2>

            {/* MCQ Options */}
            {questions[currentQ].options ? (
              <div className="quiz-options-grid">
                {questions[currentQ].options.map((opt, i) => (
                  <button key={i} className="quiz-option-btn" onClick={() => handleAnswer(opt)} disabled={loading}>
                    <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Free-text input */
              <form onSubmit={e => { e.preventDefault(); const val = e.target.elements.answer.value; if (val.trim()) handleAnswer(val.trim()); }}>
                <input type="text" name="answer" className="form-input" placeholder="Type your answer..." autoFocus
                  style={{ fontSize: '1.1rem', padding: '1rem' }} />
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                  {loading ? <><span className="spinner" /> Submitting...</> : 'Submit Answer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RESULT */}
      {tab === 'result' && (
        <div className="quiz-result-section">
          <div className="smriti-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{accuracy >= 80 ? '🌟' : accuracy >= 50 ? '👍' : '💪'}</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: accuracy >= 80 ? 'var(--color-success)' : accuracy >= 50 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
              {accuracy}% Accuracy
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-body)', margin: '0.5rem 0 1.5rem' }}>
              {correctCount} of {totalCount} correct
            </p>

            <div className="quiz-result-breakdown">
              {results.map((r, i) => (
                <div key={i} className={`quiz-result-item ${r.correct ? 'correct' : 'incorrect'}`}>
                  <span style={{ fontWeight: 600 }}>{r.correct ? '✓' : '✗'}</span>
                  <span style={{ flex: 1 }}>{r.question?.question}</span>
                  <span className="badge badge-neutral">{r.question?.activity_type}</span>
                </div>
              ))}
            </div>

            {results.length > 0 && results[results.length - 1].next_difficulty && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-primary-tint)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontWeight: 600 }}>Next difficulty: <strong>{results[results.length - 1].next_difficulty}</strong></p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Recent accuracy: {((results[results.length - 1].recent_accuracy || 0) * 100).toFixed(0)}%
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => { setTab('select'); setResults([]); setQuestions([]); setCurrentQ(0); }}>
                <Icon name="loop" size={16} /> Quiz Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEQUENCE */}
      {tab === 'sequence' && seqQuestion && (
        <div className="smriti-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
            🧩 {seqQuestion.question || 'Put these memories in chronological order'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Use the arrows to reorder.</p>

          <div className="sequence-items">
            {seqOrder.map((itemId, i) => (
              <div key={itemId} className="sequence-item">
                <span className="sequence-number">{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{getMemoryLabel(itemId)}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="btn btn-secondary btn-small" onClick={() => moveItem(i, -1)} disabled={i === 0}>↑</button>
                  <button className="btn btn-secondary btn-small" onClick={() => moveItem(i, 1)} disabled={i === seqOrder.length - 1}>↓</button>
                </div>
              </div>
            ))}
          </div>

          {!seqResult ? (
            <button className="btn btn-primary" onClick={submitSequence} disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
              {loading ? <><span className="spinner" /> Checking...</> : 'Submit Order'}
            </button>
          ) : (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>{seqResult.correct ? '🎉' : '💡'}</div>
              <h3 style={{ color: seqResult.correct ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {seqResult.correct ? 'Perfect order!' : 'Not quite right — keep practicing!'}
              </h3>
              <button className="btn btn-secondary" onClick={() => { setTab('select'); setSeqQuestion(null); setSeqResult(null); }} style={{ marginTop: '1rem' }}>
                Back to Quiz Menu
              </button>
            </div>
          )}
        </div>
      )}

      {/* WEAK MEMORIES */}
      {tab === 'weak' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Memories to Practice</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            These are memories where your recall accuracy is below 50%. Practicing them again will help strengthen the connections.
          </p>
          {weakMemories.length === 0 && (
            <div className="empty-state-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌟</div>
              <h3>Great job!</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>No weak areas detected. Keep up the practice!</p>
            </div>
          )}
          {weakMemories.map((w, i) => (
            <div key={w.memory_id || i} className="reminder-card">
              <div className="reminder-card-left">
                <span className="reminder-category-badge" style={{ background: 'var(--color-warning)' }}>⚠️</span>
                <div>
                  <h3 className="reminder-title">{getMemoryLabel(w.memory_id)}</h3>
                  <p className="reminder-due">Accuracy: {(w.accuracy * 100).toFixed(0)}% • {w.attempts} attempt(s)</p>
                </div>
              </div>
              <button className="btn btn-primary btn-small" onClick={() => { setSelectedMemoryId(w.memory_id); startQuiz(w.memory_id); }}>
                Re-Quiz
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={() => setTab('select')} style={{ marginTop: '1rem' }}>
            Back to Quiz Menu
          </button>
        </div>
      )}
    </div>
  );
}
