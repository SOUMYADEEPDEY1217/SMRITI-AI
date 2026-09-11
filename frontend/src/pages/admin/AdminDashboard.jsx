import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import {
  getPatients,
  savePatient,
  deletePatient,
  getStaff,
  saveStaff,
  deleteStaff,
  getActivities,
  updateActivity,
  getQuestions,
  saveQuestion,
  deleteQuestion,
  getMedia,
  saveMediaItem,
  deleteMediaItem,
  getAllSessions
} from '../../data/storage';
import { getAudioTrackUrl } from '../../utils/audioSynthesizer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activities, setActivities] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [media, setMedia] = useState({ photos: [], audio: [] });
  const [sessions, setSessions] = useState([]);

  // Modals & Form states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({ id: '', name: '', age: '', gender: 'Male', stage: '', difficulty: 'Medium', primaryCaregiver: '', phone: '', riskStatus: 'Stable' });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ id: '', name: '', role: 'Doctor', title: '', department: '', hospital: '', email: '' });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({ id: '', title: '', description: '', baseDifficulty: 'Medium', status: 'Active' });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    id: '',
    activityId: 'memory-garden',
    difficulty: 'Medium',
    prompt: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [questionActivityFilter, setQuestionActivityFilter] = useState('ALL');

  const [previewingAudioId, setPreviewingAudioId] = useState(null);
  const audioPreviewRef = useRef(null);

  const refreshData = () => {
    setPatients(getPatients());
    setStaff(getStaff());
    setActivities(getActivities());
    setQuestions(getQuestions());
    setMedia(getMedia());
    setSessions(getAllSessions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Patient CRUD
  const openAddPatient = () => {
    setPatientForm({
      id: `patient-${Date.now()}`,
      name: '',
      age: 70,
      gender: 'Male',
      stage: 'Mild Cognitive Impairment',
      difficulty: 'Medium',
      primaryCaregiver: '',
      phone: '',
      riskStatus: 'Stable'
    });
    setIsPatientModalOpen(true);
  };

  const openEditPatient = (p) => {
    setPatientForm(p);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (!patientForm.name) return;
    savePatient(patientForm);
    setIsPatientModalOpen(false);
    refreshData();
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Remove this patient record?')) {
      deletePatient(id);
      refreshData();
    }
  };

  // Staff CRUD
  const openAddStaff = () => {
    setStaffForm({
      id: `staff-${Date.now()}`,
      name: '',
      role: 'Doctor',
      title: 'MD Specialist',
      department: 'Geriatric Cognitive Clinic',
      hospital: 'Metro Memory Centre',
      email: ''
    });
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (s) => {
    setStaffForm(s);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffForm.name) return;
    saveStaff(staffForm);
    setIsStaffModalOpen(false);
    refreshData();
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Remove this staff member?')) {
      deleteStaff(id);
      refreshData();
    }
  };

  // Activity Management
  const openEditActivity = (act) => {
    setActivityForm(act);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    updateActivity(activityForm);
    setIsActivityModalOpen(false);
    refreshData();
  };

  // Question CRUD
  const openAddQuestion = () => {
    setQuestionForm({
      id: `q-${Date.now()}`,
      activityId: 'culture-quest',
      difficulty: 'Medium',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    setIsQuestionModalOpen(true);
  };

  const openEditQuestion = (q) => {
    setQuestionForm({
      ...q,
      options: q.options && q.options.length === 4 ? q.options : ['', '', '', '']
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.prompt || !questionForm.correctAnswer) {
      alert('Please provide prompt and correct answer.');
      return;
    }
    saveQuestion(questionForm);
    setIsQuestionModalOpen(false);
    refreshData();
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Remove this question?')) {
      deleteQuestion(id);
      refreshData();
    }
  };

  // Photo Management (File API)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const newPhoto = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Keepsake Photo',
        caption: `Custom keepsake photo added on ${new Date().toLocaleDateString()}`,
        url: dataUrl
      };
      saveMediaItem('photos', newPhoto);
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id) => {
    if (window.confirm('Remove photo from repository?')) {
      deleteMediaItem('photos', id);
      refreshData();
    }
  };

  // Audio Management (HTML5 Audio)
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const newAudio = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Voice / Melodic Audio',
        duration: '0:30',
        mood: 'Custom Audio',
        category: 'Personal Audio',
        url: dataUrl,
        isSynth: false
      };
      saveMediaItem('audio', newAudio);
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handleToggleAudioPreview = (track) => {
    if (previewingAudioId === track.id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setPreviewingAudioId(null);
    } else {
      setPreviewingAudioId(track.id);
      const url = track.url || getAudioTrackUrl(track.id);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(err => console.log('Audio preview block:', err));
      }
    }
  };

  const handleDeleteAudio = (id) => {
    if (window.confirm('Remove audio track?')) {
      deleteMediaItem('audio', id);
      refreshData();
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem' }}>
      <audio
        ref={audioPreviewRef}
        onEnded={() => setPreviewingAudioId(null)}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge-overline">Administration System</span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.3rem' }}>
            Platform Management Console
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            Manage patients, care team professionals, 10 activities, question repositories, and multimedia assets.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="admin-tabs" role="tablist" aria-label="Admin Navigation Tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'patients', label: `Patients (${patients.length})` },
          { id: 'staff', label: `Doctors/Nurses (${staff.length})` },
          { id: 'activities', label: `Activities (${activities.length})` },
          { id: 'questions', label: `Questions (${questions.length})` },
          { id: 'photos', label: `Photos (${media.photos?.length || 0})` },
          { id: 'audio', label: `Audio (${media.audio?.length || 0})` }
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="result-metric-tiles" style={{ marginBottom: '2.5rem' }}>
            <div className="metric-tile-box">
              <div className="metric-tile-number">{patients.length}</div>
              <div className="metric-tile-label">Registered Patients</div>
            </div>
            <div className="metric-tile-box">
              <div className="metric-tile-number" style={{ color: 'var(--color-teal)' }}>{staff.length}</div>
              <div className="metric-tile-label">Doctors & Nurses</div>
            </div>
            <div className="metric-tile-box">
              <div className="metric-tile-number" style={{ color: 'var(--color-primary)' }}>{activities.length}</div>
              <div className="metric-tile-label">Active Exercises</div>
            </div>
            <div className="metric-tile-box">
              <div className="metric-tile-number" style={{ color: 'var(--color-accent)' }}>{questions.length}</div>
              <div className="metric-tile-label">Question Items</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="smriti-card">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>
                Quick Management Actions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={openAddPatient} className="btn btn-primary">
                  Enroll New Patient
                </button>
                <button onClick={openAddStaff} className="btn btn-secondary">
                  Add Doctor or Nurse
                </button>
                <button onClick={openAddQuestion} className="btn btn-secondary">
                  Create Question Item
                </button>
                <button onClick={() => setActiveTab('photos')} className="btn btn-secondary">
                  Upload Keepsake Photo
                </button>
              </div>
            </div>

            <div className="smriti-card">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>
                Platform Operational Status
              </h2>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-body)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                <li><strong>Patient Records:</strong> {patients.length} active profiles</li>
                <li><strong>Session History:</strong> {sessions.length} total completed sessions</li>
                <li><strong>Media Asset Bank:</strong> {media.photos?.length || 0} photos, {media.audio?.length || 0} audio tracks</li>
                <li><strong>Adaptive Pacing:</strong> Operational & responsive</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT MANAGEMENT */}
      {activeTab === 'patients' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search patients by name or caregiver..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              aria-label="Search patients"
            />
            <button onClick={openAddPatient} className="btn btn-primary">
              Add New Patient
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table" aria-label="Manage Patients">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Clinical Stage</th>
                  <th>Pacing</th>
                  <th>Risk Status</th>
                  <th>Caregiver Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.primaryCaregiver?.toLowerCase().includes(patientSearch.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.age} yrs • {p.gender}</td>
                      <td>{p.stage}</td>
                      <td><span className="badge badge-neutral">{p.difficulty}</span></td>
                      <td><span className={`badge badge-${p.riskStatus === 'Stable' ? 'easy' : 'hard'}`}>{p.riskStatus}</span></td>
                      <td>{p.primaryCaregiver} ({p.phone})</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openEditPatient(p)} className="btn btn-secondary btn-small">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePatient(p.id)} className="btn btn-secondary btn-small" style={{ color: 'var(--color-danger)' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search clinician or nurse..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              aria-label="Search staff"
            />
            <button onClick={openAddStaff} className="btn btn-primary">
              Add Doctor / Nurse
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table" aria-label="Manage Staff">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Hospital / Centre</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff
                  .filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase()) || s.department?.toLowerCase().includes(staffSearch.toLowerCase()))
                  .map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge badge-neutral">{s.role}</span></td>
                      <td>{s.title}</td>
                      <td>{s.department}</td>
                      <td>{s.hospital}</td>
                      <td>{s.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openEditStaff(s)} className="btn btn-secondary btn-small">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteStaff(s.id)} className="btn btn-secondary btn-small" style={{ color: 'var(--color-danger)' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div>
          <div className="data-table-container">
            <table className="data-table" aria-label="Manage Activities">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activity Name</th>
                  <th>Cognitive Category</th>
                  <th>Base Pace</th>
                  <th>Status</th>
                  <th>Estimated Duration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={act.id}>
                    <td>{idx + 1}</td>
                    <td><strong>{act.title}</strong></td>
                    <td>{act.category}</td>
                    <td><span className="badge badge-neutral">{act.baseDifficulty}</span></td>
                    <td><span className="badge badge-easy">{act.status || 'Active'}</span></td>
                    <td>{act.estimatedTime}</td>
                    <td>
                      <button onClick={() => openEditActivity(act)} className="btn btn-secondary btn-small">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: QUESTION MANAGEMENT */}
      {activeTab === 'questions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <select
              className="filter-select"
              value={questionActivityFilter}
              onChange={(e) => setQuestionActivityFilter(e.target.value)}
              aria-label="Filter questions by activity"
            >
              <option value="ALL">All Activities ({questions.length})</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>

            <button onClick={openAddQuestion} className="btn btn-primary">
              Create Question
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table" aria-label="Manage Questions">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Pacing</th>
                  <th>Question Prompt</th>
                  <th>Correct Answer</th>
                  <th>Explanation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions
                  .filter(q => questionActivityFilter === 'ALL' || q.activityId === questionActivityFilter)
                  .map((q) => (
                    <tr key={q.id}>
                      <td><strong style={{ textTransform: 'capitalize' }}>{q.activityId?.replace('-', ' ')}</strong></td>
                      <td><span className="badge badge-neutral">{q.difficulty}</span></td>
                      <td style={{ maxWidth: '300px' }}>{q.prompt}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{q.correctAnswer}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '200px' }}>{q.explanation}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openEditQuestion(q)} className="btn btn-secondary btn-small">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-secondary btn-small" style={{ color: 'var(--color-danger)' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PHOTOS MANAGEMENT */}
      {activeTab === 'photos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Keepsake Photograph Repository</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                Manage photos used in Familiar Face and Family Puzzle activities.
              </p>
            </div>

            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <span>Select Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {media.photos && media.photos.map((photo) => (
              <div key={photo.id} className="smriti-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '170px', background: 'var(--color-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photo.url?.startsWith('data:') ? (
                    <img src={photo.url} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem' }}>📸</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{photo.title}</div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{photo.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{photo.category}</div>
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDeletePhoto(photo.id)} className="btn btn-secondary btn-small" style={{ color: 'var(--color-danger)' }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIO MANAGEMENT */}
      {activeTab === 'audio' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Memory Radio Audio Bank</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                Preview HTML5 audio soundscapes and manage personalized audio tracks.
              </p>
            </div>

            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <span>Select Audio from Device</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {media.audio && media.audio.map((track) => {
              const isPlaying = previewingAudioId === track.id;

              return (
                <div key={track.id} className="smriti-card" style={{ borderLeft: '5px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-neutral">{track.category || 'Soundscape'}</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>{track.title}</h3>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                        {track.artist} • {track.duration}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => handleToggleAudioPreview(track)}
                      className="btn btn-primary btn-small"
                    >
                      {isPlaying ? 'Pause Audio' : 'Preview Audio'}
                    </button>
                    <button
                      onClick={() => handleDeleteAudio(track.id)}
                      className="btn btn-secondary btn-small"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title={patientForm.id ? "Edit Patient Profile" : "Enroll New Patient"}
        footer={
          <>
            <button onClick={() => setIsPatientModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSavePatient} className="btn btn-primary">Save Patient</button>
          </>
        }
      >
        <form onSubmit={handleSavePatient}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Stage</label>
            <input
              type="text"
              className="form-control"
              value={patientForm.stage}
              onChange={(e) => setPatientForm({ ...patientForm, stage: e.target.value })}
              placeholder="e.g. Mild Cognitive Impairment"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Adaptive Pace</label>
              <select
                className="form-control"
                value={patientForm.difficulty}
                onChange={(e) => setPatientForm({ ...patientForm, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Clinical Status</label>
              <select
                className="form-control"
                value={patientForm.riskStatus}
                onChange={(e) => setPatientForm({ ...patientForm, riskStatus: e.target.value })}
              >
                <option value="Stable">Stable</option>
                <option value="Review Needed">Review Needed</option>
                <option value="High Attention">High Attention</option>
                <option value="Improving">Improving</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Caregiver</label>
            <input
              type="text"
              className="form-control"
              value={patientForm.primaryCaregiver}
              onChange={(e) => setPatientForm({ ...patientForm, primaryCaregiver: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={staffForm.id ? "Edit Clinician Profile" : "Add Clinician/Nurse"}
        footer={
          <>
            <button onClick={() => setIsStaffModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveStaff} className="btn btn-primary">Save Staff</button>
          </>
        }
      >
        <form onSubmit={handleSaveStaff}>
          <div className="form-group">
            <label className="form-label">Staff Name</label>
            <input
              type="text"
              className="form-control"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={staffForm.title}
                onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-control"
              value={staffForm.department}
              onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hospital / Clinic</label>
            <input
              type="text"
              className="form-control"
              value={staffForm.hospital}
              onChange={(e) => setStaffForm({ ...staffForm, hospital: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title={`Edit Activity: ${activityForm.title}`}
        footer={
          <>
            <button onClick={() => setIsActivityModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveActivity} className="btn btn-primary">Save Changes</button>
          </>
        }
      >
        <form onSubmit={handleSaveActivity}>
          <div className="form-group">
            <label className="form-label">Activity Title</label>
            <input
              type="text"
              className="form-control"
              value={activityForm.title}
              onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Base Pacing</label>
              <select
                className="form-control"
                value={activityForm.baseDifficulty}
                onChange={(e) => setActivityForm({ ...activityForm, baseDifficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={activityForm.status}
                onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={questionForm.id ? "Edit Question Item" : "Create New Question"}
        footer={
          <>
            <button onClick={() => setIsQuestionModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveQuestion} className="btn btn-primary">Save Question</button>
          </>
        }
      >
        <form onSubmit={handleSaveQuestion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Activity</label>
              <select
                className="form-control"
                value={questionForm.activityId}
                onChange={(e) => setQuestionForm({ ...questionForm, activityId: e.target.value })}
              >
                {activities.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pacing</label>
              <select
                className="form-control"
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Question Prompt</label>
            <textarea
              className="form-control"
              rows="2"
              value={questionForm.prompt}
              onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Options (4 choices)</label>
            {[0, 1, 2, 3].map((optIdx) => (
              <input
                key={optIdx}
                type="text"
                className="form-control"
                style={{ marginBottom: '0.5rem' }}
                placeholder={`Option ${optIdx + 1}`}
                value={questionForm.options[optIdx] || ''}
                onChange={(e) => {
                  const newOpts = [...questionForm.options];
                  newOpts[optIdx] = e.target.value;
                  setQuestionForm({ ...questionForm, options: newOpts });
                }}
                required
              />
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Correct Answer (exact match)</label>
            <input
              type="text"
              className="form-control"
              value={questionForm.correctAnswer}
              onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Explanation</label>
            <input
              type="text"
              className="form-control"
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
