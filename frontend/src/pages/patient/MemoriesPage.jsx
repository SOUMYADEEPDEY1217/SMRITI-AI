import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { analyzeMemoryPhoto, saveVerifiedMemory, listMemories } from '../../data/api';

export default function MemoriesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('gallery'); // gallery | upload | verify
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Editable verification fields
  const [verifyData, setVerifyData] = useState({
    people: '',
    location: '',
    activity: '',
    event: '',
    story: '',
    scene: '',
    objects: '',
    occurred_at: ''
  });

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    const data = await listMemories();
    setMemories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    const result = await analyzeMemoryPhoto(selectedFile);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setAnalysisResult(result);
    // Pre-fill verification form from hypothesis
    const h = result.hypothesis || {};
    setVerifyData({
      people: (result.face_suggestions || []).filter(f => f.suggested_name).map(f => f.suggested_name).join(', '),
      location: h.location_hint || '',
      activity: h.activity || '',
      event: h.context || '',
      story: '',
      scene: h.scene || '',
      objects: (h.objects || []).join(', '),
      occurred_at: ''
    });
    setTab('verify');
    setLoading(false);
  }

  async function handleSaveMemory() {
    if (!analysisResult) return;
    setLoading(true);
    setError('');
    const saveData = {
      memory_id: analysisResult.memory_id,
      photo_url: analysisResult.photo_url,
      people: verifyData.people.split(',').map(s => s.trim()).filter(Boolean),
      location: verifyData.location || null,
      activity: verifyData.activity || null,
      event: verifyData.event || null,
      story: verifyData.story || null,
      scene: verifyData.scene || null,
      objects: verifyData.objects.split(',').map(s => s.trim()).filter(Boolean),
      occurred_at: verifyData.occurred_at || null
    };
    const result = await saveVerifiedMemory(saveData);
    if (result.error) {
      setError(result.error);
    } else {
      setTab('gallery');
      setAnalysisResult(null);
      setSelectedFile(null);
      setPreviewUrl('');
      await loadMemories();
    }
    setLoading(false);
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <section className="patient-header-banner" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge-overline">Memory Vault</span>
          <h1 className="patient-greeting-title">My Memories</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-body)', marginTop: '0.4rem', maxWidth: '600px' }}>
            Upload photos of cherished moments. AI will help identify scenes, people, and objects — then you verify and save.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="memories-tab-bar">
        <button className={`memories-tab ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>
          <Icon name="garden" size={18} /> Gallery ({memories.length})
        </button>
        <button className={`memories-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => { setTab('upload'); setAnalysisResult(null); setError(''); }}>
          <Icon name="companion" size={18} /> Upload New
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-danger" style={{ marginBottom: '1.5rem' }}>
          <Icon name="heart" size={16} /> {error}
        </div>
      )}

      {/* GALLERY VIEW */}
      {tab === 'gallery' && (
        <div className="memories-gallery-grid">
          {loading && <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading memories...</p>}
          {!loading && memories.length === 0 && (
            <div className="empty-state-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <h3>No memories yet</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Upload your first photo to start building your memory vault.</p>
              <button className="btn btn-primary" onClick={() => setTab('upload')} style={{ marginTop: '1rem' }}>
                Upload First Memory
              </button>
            </div>
          )}
          {memories.map((mem, i) => (
            <div key={mem._id || mem.memory_id || i} className="memory-card">
              {mem.photo_url && (
                <div className="memory-card-photo">
                  <img src={mem.photo_url} alt={mem.scene || 'Memory'} />
                </div>
              )}
              <div className="memory-card-body">
                <h3 className="memory-card-title">{mem.scene || mem.activity || 'Untitled Memory'}</h3>
                {mem.people && mem.people.length > 0 && (
                  <div className="memory-meta">
                    <Icon name="face" size={14} /> {mem.people.join(', ')}
                  </div>
                )}
                {mem.location && (
                  <div className="memory-meta">
                    <Icon name="walk" size={14} /> {mem.location}
                  </div>
                )}
                {mem.activity && (
                  <div className="memory-meta">
                    <Icon name="companion" size={14} /> {mem.activity}
                  </div>
                )}
                <div className="memory-card-actions">
                  <button className="btn btn-secondary btn-small" onClick={() => navigate(`/patient/quiz?memory=${mem._id || mem.memory_id}`)}>
                    <Icon name="puzzle" size={14} /> Practice Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD VIEW */}
      {tab === 'upload' && !analysisResult && (
        <div className="upload-section">
          <div className="upload-dropzone" onClick={() => document.getElementById('memory-file-input').click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="upload-preview-img" />
            ) : (
              <div className="upload-placeholder">
                <div style={{ fontSize: '3rem' }}>📷</div>
                <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Click to choose a photo</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>JPEG, PNG, or WEBP • Max 10MB</p>
              </div>
            )}
            <input
              id="memory-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
          {selectedFile && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-body)' }}>
                <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
              <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <><span className="spinner" /> Analyzing with AI...</>
                ) : (
                  <><Icon name="fingerprint" size={18} /> Analyze Photo</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VERIFY VIEW */}
      {tab === 'verify' && analysisResult && (
        <div className="verify-section">
          <div className="verify-layout">
            {/* Photo + AI Hypothesis */}
            <div className="verify-photo-panel">
              {analysisResult.photo_url && (
                <img src={analysisResult.photo_url} alt="Memory" className="verify-photo" />
              )}
              <div className="hypothesis-card">
                <span className="badge badge-neutral">AI Hypothesis</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Confidence: {((analysisResult.hypothesis?.confidence || 0) * 100).toFixed(0)}%
                </p>
                {analysisResult.face_suggestions && analysisResult.face_suggestions.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Faces detected:</strong>
                    {analysisResult.face_suggestions.map((f, i) => (
                      <div key={i} className="face-suggestion-item">
                        {f.suggested_name ? (
                          <span>👤 {f.suggested_name} ({((f.similarity || 0) * 100).toFixed(0)}% match)</span>
                        ) : (
                          <span>👤 Unknown face</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editable Form */}
            <div className="verify-form-panel">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Verify & Correct Details
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                Review what the AI detected and make corrections. Your input makes the memory accurate.
              </p>

              <div className="form-group">
                <label className="form-label">People in this photo</label>
                <input type="text" className="form-input" placeholder="e.g. Dad, Mom, Priya (comma separated)"
                  value={verifyData.people} onChange={e => setVerifyData(d => ({ ...d, people: e.target.value }))} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Scene</label>
                  <input type="text" className="form-input" placeholder="e.g. beach, park, home"
                    value={verifyData.scene} onChange={e => setVerifyData(d => ({ ...d, scene: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="e.g. Juhu Beach, Mumbai"
                    value={verifyData.location} onChange={e => setVerifyData(d => ({ ...d, location: e.target.value }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Activity</label>
                  <input type="text" className="form-input" placeholder="e.g. celebrating, walking"
                    value={verifyData.activity} onChange={e => setVerifyData(d => ({ ...d, activity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Event / Occasion</label>
                  <input type="text" className="form-input" placeholder="e.g. Diwali, Birthday"
                    value={verifyData.event} onChange={e => setVerifyData(d => ({ ...d, event: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Objects seen</label>
                <input type="text" className="form-input" placeholder="e.g. cake, flowers, flag (comma separated)"
                  value={verifyData.objects} onChange={e => setVerifyData(d => ({ ...d, objects: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Your story about this memory</label>
                <textarea className="form-textarea" rows="3" placeholder="Share what makes this memory special..."
                  value={verifyData.story} onChange={e => setVerifyData(d => ({ ...d, story: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">When did this happen? (optional)</label>
                <input type="date" className="form-input"
                  value={verifyData.occurred_at} onChange={e => setVerifyData(d => ({ ...d, occurred_at: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={handleSaveMemory} disabled={loading}>
                  {loading ? <><span className="spinner" /> Saving...</> : <><Icon name="heart" size={16} /> Save Memory</>}
                </button>
                <button className="btn btn-secondary" onClick={() => { setTab('upload'); setAnalysisResult(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
