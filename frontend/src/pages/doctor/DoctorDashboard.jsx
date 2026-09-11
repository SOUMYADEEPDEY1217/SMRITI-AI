import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import { fetchClinicianPatients } from '../../data/api';
import { getAllSessions, getCurrentUser } from '../../data/storage';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    async function loadData() {
      const data = await fetchClinicianPatients();
      setPatients(data);
      setSessions(getAllSessions());
    }
    loadData();
  }, []);

  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.primaryCaregiver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || patient.riskStatus?.toUpperCase() === statusFilter.toUpperCase();

      const matchesDifficulty =
        difficultyFilter === 'ALL' || patient.difficulty?.toUpperCase() === difficultyFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.registeredDate || 0) - new Date(a.registeredDate || 0);
      } else if (sortBy === 'score') {
        const aSessions = sessions.filter(s => s.patientId === a.id);
        const bSessions = sessions.filter(s => s.patientId === b.id);
        const aAvg = aSessions.length > 0 ? aSessions.reduce((acc, s) => acc + s.score, 0) / aSessions.length : 0;
        const bAvg = bSessions.length > 0 ? bSessions.reduce((acc, s) => acc + s.score, 0) / bSessions.length : 0;
        return bAvg - aAvg;
      }
      return 0;
    });

  const totalPatients = patients.length;
  const totalCompletedSessions = sessions.length;
  const reviewNeededCount = patients.filter(p => p.riskStatus === 'Review Needed' || p.riskStatus === 'High Attention').length;
  const overallAvgScore = totalCompletedSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / totalCompletedSessions)
    : 82;

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Clinician Overview Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <span className="badge-overline">
            Clinical Care Portal
          </span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '0.4rem', color: 'var(--color-primary)' }}>
            Welcome, {currentUser?.name || 'Dr. Ananya Sharma'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.3rem', fontSize: '1rem' }}>
            Monitor patient cognitive trajectories, longitudinal accuracy trends, and adaptive challenge levels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--color-bg-surface)', padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalPatients}</div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Roster Patients</div>
          </div>
          <div style={{ background: 'var(--color-bg-surface)', padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalCompletedSessions}</div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Total Sessions</div>
          </div>
          <div style={{ background: 'var(--color-bg-surface)', padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-success)' }}>{overallAvgScore}%</div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Mean Accuracy</div>
          </div>
          <div style={{ background: 'var(--color-bg-surface)', padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: reviewNeededCount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {reviewNeededCount}
            </div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Review Flags</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="smriti-card" style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div style={{ flex: '1 1 320px' }}>
            <input
              type="search"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="Search patients by name, ID, or caregiver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search patients"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by clinical status"
            >
              <option value="ALL">All Clinical Statuses</option>
              <option value="STABLE">Stable</option>
              <option value="REVIEW NEEDED">Review Needed</option>
              <option value="HIGH ATTENTION">High Attention</option>
              <option value="IMPROVING">Improving</option>
            </select>

            <select
              className="filter-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label="Filter by adaptive difficulty"
            >
              <option value="ALL">All Difficulty Paces</option>
              <option value="EASY">Easy Pace</option>
              <option value="MEDIUM">Medium Pace</option>
              <option value="HARD">Hard Pace</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort patient list"
            >
              <option value="name">Sort: Alphabetical (A-Z)</option>
              <option value="score">Sort: Highest Mean Score</option>
              <option value="date">Sort: Recent Registration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="data-table-container">
        <table className="data-table" aria-label="Patient Roster">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age & Clinical Stage</th>
              <th>Caregiver Contact</th>
              <th>Adaptive Pace</th>
              <th>Clinical Status</th>
              <th>Engagement History</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No patients match your search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const patientSessions = sessions.filter(s => s.patientId === patient.id);
                const avgScore = patientSessions.length > 0
                  ? Math.round(patientSessions.reduce((acc, s) => acc + s.score, 0) / patientSessions.length)
                  : 'N/A';

                return (
                  <tr key={patient.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-title)' }}>
                        {patient.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ID: {patient.id}
                      </div>
                    </td>
                    <td>
                      <div>{patient.age} yrs • {patient.gender}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {patient.stage}
                      </div>
                    </td>
                    <td>
                      <div>{patient.primaryCaregiver}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {patient.phone}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${patient.difficulty?.toLowerCase()}`}>
                        {patient.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${patient.riskStatus === 'Stable' || patient.riskStatus === 'Improving' ? 'easy' : 'hard'}`}>
                        {patient.riskStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {patientSessions.length} sessions
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Mean Score: {avgScore !== 'N/A' ? `${avgScore}%` : 'Pending'}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="btn btn-secondary btn-small"
                      >
                        <span>Profile & Charts</span>
                        <Icon name="arrow-right" size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
