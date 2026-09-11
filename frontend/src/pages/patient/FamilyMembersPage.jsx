import React, { useState, useEffect } from 'react';
import Icon from '../../components/common/Icons';
import { enrollFamilyMember, listFamilyMembers, recognizeFaces } from '../../data/api';

export default function FamilyMembersPage() {
  const [tab, setTab] = useState('list'); // list | enroll | recognize
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enroll form
  const [enrollName, setEnrollName] = useState('');
  const [enrollRelation, setEnrollRelation] = useState('');
  const [enrollPhotos, setEnrollPhotos] = useState([]);

  // Recognition
  const [recognizeFile, setRecognizeFile] = useState(null);
  const [recognizePreview, setRecognizePreview] = useState('');
  const [recognizeResult, setRecognizeResult] = useState(null);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    setLoading(true);
    const data = await listFamilyMembers();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleEnroll(e) {
    e.preventDefault();
    if (!enrollName.trim() || !enrollRelation.trim()) {
      setError('Name and relationship are required.');
      return;
    }
    if (enrollPhotos.length === 0) {
      setError('Please upload at least 1 photo.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await enrollFamilyMember(enrollName, enrollRelation, enrollPhotos);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`${enrollName} enrolled successfully with ${result.enrolled_photo_count || enrollPhotos.length} photo(s)!`);
      setEnrollName('');
      setEnrollRelation('');
      setEnrollPhotos([]);
      setTab('list');
      await loadMembers();
    }
    setLoading(false);
  }

  async function handleRecognize() {
    if (!recognizeFile) return;
    setLoading(true);
    setError('');
    setRecognizeResult(null);
    const result = await recognizeFaces(recognizeFile);
    if (result.error) {
      setError(result.error);
    } else {
      setRecognizeResult(result);
    }
    setLoading(false);
  }

  const relationIcons = {
    'Son': '👦', 'Daughter': '👧', 'Wife': '👩', 'Husband': '👨',
    'Mother': '👵', 'Father': '👴', 'Brother': '🧑', 'Sister': '👩',
    'Grandson': '👶', 'Granddaughter': '👶', 'Friend': '🤝'
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <section className="patient-header-banner" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge-overline">Family Circle</span>
          <h1 className="patient-greeting-title">Family Members</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-body)', marginTop: '0.4rem', maxWidth: '600px' }}>
            Enroll family faces so the AI can recognize them in your memory photos.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="memories-tab-bar">
        <button className={`memories-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => { setTab('list'); setError(''); }}>
          <Icon name="face" size={18} /> Members ({members.length})
        </button>
        <button className={`memories-tab ${tab === 'enroll' ? 'active' : ''}`} onClick={() => { setTab('enroll'); setError(''); setSuccess(''); }}>
          <Icon name="companion" size={18} /> Enroll New
        </button>
        <button className={`memories-tab ${tab === 'recognize' ? 'active' : ''}`} onClick={() => { setTab('recognize'); setError(''); }}>
          <Icon name="fingerprint" size={18} /> Recognize
        </button>
      </div>

      {error && <div className="alert-banner alert-danger"><Icon name="heart" size={16} /> {error}</div>}
      {success && <div className="alert-banner alert-success"><Icon name="heart" size={16} /> {success}</div>}

      {/* LIST VIEW */}
      {tab === 'list' && (
        <div className="family-members-grid">
          {loading && <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading...</p>}
          {!loading && members.length === 0 && (
            <div className="empty-state-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
              <h3>No family members enrolled</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Enroll family faces so the AI can help identify them in your photos.</p>
              <button className="btn btn-primary" onClick={() => setTab('enroll')} style={{ marginTop: '1rem' }}>
                Enroll First Member
              </button>
            </div>
          )}
          {members.map((m, i) => (
            <div key={m.member_id || i} className="family-member-card">
              <div className="family-member-avatar">
                {relationIcons[m.relationship] || '👤'}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{m.name}</h3>
                <span className="badge badge-neutral">{m.relationship}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLL VIEW */}
      {tab === 'enroll' && (
        <div className="enroll-section">
          <form onSubmit={handleEnroll} className="smriti-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <Icon name="face" size={20} /> Enroll a Family Member
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. Aarav Patel"
                value={enrollName} onChange={e => setEnrollName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select className="form-input" value={enrollRelation} onChange={e => setEnrollRelation(e.target.value)}>
                <option value="">Select...</option>
                {['Son', 'Daughter', 'Wife', 'Husband', 'Mother', 'Father', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Friend'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Photos (1–5 clear, front-facing photos)</label>
              <input type="file" className="form-input" accept="image/jpeg,image/png,image/webp" multiple
                onChange={e => setEnrollPhotos(Array.from(e.target.files || []).slice(0, 5))} />
              {enrollPhotos.length > 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                  {enrollPhotos.length} photo(s) selected
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? <><span className="spinner" /> Enrolling...</> : <><Icon name="heart" size={16} /> Enroll Member</>}
            </button>
          </form>
        </div>
      )}

      {/* RECOGNIZE VIEW */}
      {tab === 'recognize' && (
        <div className="recognize-section">
          <div className="smriti-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              <Icon name="fingerprint" size={20} /> Face Recognition
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              Upload a photo to identify enrolled family members.
            </p>

            <div className="upload-dropzone" style={{ minHeight: '180px' }}
              onClick={() => document.getElementById('recognize-file-input').click()}>
              {recognizePreview ? (
                <img src={recognizePreview} alt="Preview" className="upload-preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <div style={{ fontSize: '2.5rem' }}>🔍</div>
                  <p style={{ fontWeight: 600 }}>Click to choose a photo</p>
                </div>
              )}
              <input id="recognize-file-input" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setRecognizeFile(f); setRecognizePreview(URL.createObjectURL(f)); setRecognizeResult(null); }
                }} />
            </div>

            {recognizeFile && (
              <button className="btn btn-primary" onClick={handleRecognize} disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                {loading ? <><span className="spinner" /> Scanning...</> : 'Recognize Faces'}
              </button>
            )}

            {recognizeResult && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 600 }}>Results: {recognizeResult.faces_detected} face(s) detected</h3>
                {(recognizeResult.suggestions || []).map((s, i) => (
                  <div key={i} className="face-suggestion-item" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                    {s.suggested_match ? (
                      <div>
                        <span style={{ fontWeight: 700 }}>👤 {s.suggested_match.name}</span>
                        <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>
                          {((s.suggested_match.similarity || 0) * 100).toFixed(0)}% match
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>👤 Unknown face</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
