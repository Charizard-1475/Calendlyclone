import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Clock, Globe } from 'lucide-react';

export default function UserPublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/public/users/${username}`);
        setProfile(res.data);
      } catch (err) {
        setError('User not found');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div style={{ textAlign: 'center' }}>Loading profile...</div>;
  if (error || !profile) return <div style={{ textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <h2>{profile.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.</p>
      </div>

      <div className="grid-cols-3">
        {profile.eventTypes.map(event => (
          <Link to={`/book/${profile.username}/${event.slug}`} key={event.id}>
            <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderRight: '5px solid var(--primary)', position: 'absolute', top: 0, bottom: 0, left: 0, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }} />
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{event.name}</h3>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '0.8rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {event.duration} mins</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {profile.eventTypes.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          No event types available currently.
        </div>
      )}
    </div>
  );
}
