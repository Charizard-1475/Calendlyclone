import { useState, useEffect } from 'react';
import api from '../api';
import { format, isPast, isFuture } from 'date-fns';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this meeting?')) return;
    try {
      await api.delete(`/meetings/${id}`);
      fetchMeetings();
    } catch (e) {
      alert('Failed to cancel');
    }
  };

  const upcoming = meetings.filter(m => isFuture(new Date(m.startTime)) && m.status === 'CONFIRMED');
  const past = meetings.filter(m => isPast(new Date(m.startTime)) || m.status === 'CANCELLED');

  if (loading) return <div>Loading meetings...</div>;

  const renderMeetingCard = (m, isPastView = false) => (
    <div key={m.id} className="card animate-fade" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ marginBottom: '0.2rem' }}>{format(new Date(m.startTime), 'EEEE, MMMM d, yyyy')}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {format(new Date(m.startTime), 'h:mm a')} - {format(new Date(m.endTime), 'h:mm a')}
        </p>
        <p><strong>{m.inviteeName}</strong> ({m.inviteeEmail})</p>
        <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Event type: {m.eventType?.name}</p>
        {m.status === 'CANCELLED' && <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block' }}>CANCELLED</span>}
      </div>
      {!isPastView && m.status === 'CONFIRMED' && (
        <button onClick={() => handleCancel(m.id)} className="btn btn-secondary" style={{ color: 'var(--danger)' }}>Cancel</button>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Meetings</h2>
      
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Upcoming</h3>
      {upcoming.length === 0 ? <p style={{ marginBottom: '2rem' }}>No upcoming meetings.</p> : upcoming.map(m => renderMeetingCard(m))}
      
      <h3 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Past & Cancelled</h3>
      {past.length === 0 ? <p>No past meetings.</p> : past.map(m => renderMeetingCard(m, true))}
    </div>
  );
}
