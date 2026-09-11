import React, { useState, useEffect } from 'react';
import Icon from '../../components/common/Icons';
import { createReminder, listReminders, getUpcomingReminders, completeReminder, deleteReminder } from '../../data/api';

const CATEGORIES = [
  { id: 'medication', label: 'Medication', emoji: '💊', color: 'var(--color-info)' },
  { id: 'appointment', label: 'Appointment', emoji: '🏥', color: 'var(--color-teal)' },
  { id: 'hydration', label: 'Hydration', emoji: '💧', color: 'var(--color-success)' },
  { id: 'exercise', label: 'Exercise', emoji: '🚶', color: 'var(--color-accent)' },
  { id: 'meal', label: 'Meal', emoji: '🍽️', color: 'var(--color-warning)' },
  { id: 'other', label: 'Other', emoji: '📌', color: 'var(--color-text-muted)' }
];

export default function RemindersPage() {
  const [tab, setTab] = useState('upcoming'); // upcoming | all | create
  const [reminders, setReminders] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [form, setForm] = useState({
    title: '', notes: '', due_date: '', due_time: '09:00',
    recurrence: 'none', category: 'medication'
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [r, u] = await Promise.all([listReminders(true), getUpcomingReminders(24)]);
    setReminders(Array.isArray(r) ? r : []);
    setUpcoming(Array.isArray(u) ? u : []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.due_date) { setError('Due date is required.'); return; }
    setLoading(true);
    setError('');
    const dueAt = new Date(`${form.due_date}T${form.due_time}:00`).toISOString();
    const result = await createReminder(form.title, form.notes || null, dueAt, form.recurrence, form.category);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Reminder created!');
      setForm({ title: '', notes: '', due_date: '', due_time: '09:00', recurrence: 'none', category: 'medication' });
      setTab('upcoming');
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  }

  async function handleComplete(id) {
    setLoading(true);
    const result = await completeReminder(id);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.next_reminder ? 'Done! Next occurrence scheduled.' : 'Marked as completed!');
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this reminder?')) return;
    await deleteReminder(id);
    await loadAll();
  }

  function formatDue(isoStr) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' +
             d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return isoStr; }
  }

  function getCategoryMeta(catId) {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
  }

  function isOverdue(dueAt) {
    try { return new Date(dueAt) < new Date(); } catch { return false; }
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <section className="patient-header-banner" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge-overline">Care Routine</span>
          <h1 className="patient-greeting-title">Reminders</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-body)', marginTop: '0.4rem', maxWidth: '600px' }}>
            Never miss medication, appointments, or daily routines. Set reminders with smart recurrence.
          </p>
        </div>
      </section>

      <div className="memories-tab-bar">
        <button className={`memories-tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
          <Icon name="clock" size={18} /> Upcoming ({upcoming.length})
        </button>
        <button className={`memories-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          <Icon name="story" size={18} /> All ({reminders.length})
        </button>
        <button className={`memories-tab ${tab === 'create' ? 'active' : ''}`} onClick={() => { setTab('create'); setError(''); }}>
          <Icon name="companion" size={18} /> Create New
        </button>
      </div>

      {error && <div className="alert-banner alert-danger"><Icon name="heart" size={16} /> {error}</div>}
      {success && <div className="alert-banner alert-success"><Icon name="heart" size={16} /> {success}</div>}

      {/* UPCOMING */}
      {tab === 'upcoming' && (
        <div className="reminders-list">
          {loading && <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading...</p>}
          {!loading && upcoming.length === 0 && (
            <div className="empty-state-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
              <h3>No upcoming reminders</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Create a reminder to stay on track with your care routine.</p>
              <button className="btn btn-primary" onClick={() => setTab('create')} style={{ marginTop: '1rem' }}>Create Reminder</button>
            </div>
          )}
          {upcoming.map((r, i) => {
            const cat = getCategoryMeta(r.category);
            return (
              <div key={r._id || i} className={`reminder-card ${isOverdue(r.due_at) ? 'overdue' : ''}`}>
                <div className="reminder-card-left">
                  <span className="reminder-category-badge" style={{ background: cat.color }}>{cat.emoji}</span>
                  <div>
                    <h3 className="reminder-title">{r.title}</h3>
                    {r.notes && <p className="reminder-notes">{r.notes}</p>}
                    <p className="reminder-due">
                      <Icon name="clock" size={13} /> {formatDue(r.due_at)}
                      {r.recurrence !== 'none' && <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>{r.recurrence}</span>}
                    </p>
                  </div>
                </div>
                <div className="reminder-card-actions">
                  <button className="btn btn-primary btn-small" onClick={() => handleComplete(r._id)} title="Mark done">
                    ✓ Done
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleDelete(r._id)} title="Delete"
                    style={{ color: 'var(--color-danger)' }}>
                    <Icon name="heart" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALL */}
      {tab === 'all' && (
        <div className="reminders-list">
          {reminders.length === 0 && !loading && (
            <div className="empty-state-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>No reminders yet</h3>
            </div>
          )}
          {reminders.map((r, i) => {
            const cat = getCategoryMeta(r.category);
            return (
              <div key={r._id || i} className={`reminder-card ${r.completed ? 'completed' : ''}`}>
                <div className="reminder-card-left">
                  <span className="reminder-category-badge" style={{ background: r.completed ? 'var(--color-text-subtle)' : cat.color }}>{cat.emoji}</span>
                  <div>
                    <h3 className="reminder-title" style={r.completed ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>{r.title}</h3>
                    <p className="reminder-due">
                      <Icon name="clock" size={13} /> {formatDue(r.due_at)}
                      {r.completed && <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>Completed</span>}
                    </p>
                  </div>
                </div>
                {!r.completed && (
                  <div className="reminder-card-actions">
                    <button className="btn btn-primary btn-small" onClick={() => handleComplete(r._id)}>✓ Done</button>
                    <button className="btn btn-secondary btn-small" onClick={() => handleDelete(r._id)} style={{ color: 'var(--color-danger)' }}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE */}
      {tab === 'create' && (
        <div className="smriti-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <Icon name="clock" size={20} /> New Reminder
          </h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" placeholder="e.g. Take morning medicine"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" rows="2" placeholder="Any additional details..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input"
                  value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-input"
                  value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Recurrence</label>
                <select className="form-input" value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}>
                  <option value="none">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
              {loading ? <><span className="spinner" /> Creating...</> : <><Icon name="clock" size={16} /> Create Reminder</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
