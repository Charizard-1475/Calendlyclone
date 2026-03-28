import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Plus, Link as LinkIcon, Clock, Trash2, Copy } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newType, setNewType] = useState({ name: '', duration: 30, slug: '' });

  const fetchEventTypes = async () => {
    try {
      const res = await api.get('/event-types');
      setEventTypes(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchEventTypes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/event-types', newType);
      setIsCreating(false);
      setNewType({ name: '', duration: 30, slug: '' });
      fetchEventTypes();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating event type');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/event-types/${id}`);
      fetchEventTypes();
    } catch (e) { alert('Failed to delete'); }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Loading your dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>My Event Types</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Event Type
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'inline-block' }}>
        <Link to={`/book/${user?.username}`} target="_blank" className="btn btn-secondary">
          <LinkIcon size={16} /> View my public page
        </Link>
      </div>

      {isCreating && (
        <div className="card animate-fade" style={{ marginBottom: '2rem' }}>
          <h3>Create New Event Type</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1rem' }}>
            <input placeholder="Event Name (e.g., 30 Min Coffee)" required value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} />
            <input type="number" placeholder="Duration (mins)" required value={newType.duration} onChange={e => setNewType({...newType, duration: parseInt(e.target.value)})} />
            <input placeholder="URL Slug (e.g., 30-min-coffee)" required value={newType.slug} onChange={e => setNewType({...newType, slug: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cols-3">
        {eventTypes.map(type => (
          <div key={type.id} className="card card-hover">
            <h3 style={{ marginBottom: '0.5rem' }}>{type.name}</h3>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {type.duration} mins</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><LinkIcon size={16} /> /{type.slug}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <Link to={`/book/${user?.username}/${type.slug}`} className="text-gradient hover:underline" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Booking page
              </Link>
              <button onClick={() => handleDelete(type.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger)', border: 'none' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {eventTypes.length === 0 && !isCreating && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>No event types found.</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first event type to start accepting bookings.</p>
        </div>
      )}
    </div>
  );
}
