import { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/availability');
        if (res.data.length === 0) {
          // default 9-5 Mon-Fri
          const defaultSched = [];
          for (let i = 1; i <= 5; i++) {
            defaultSched.push({ dayOfWeek: i, startTime: '09:00', endTime: '17:00' });
          }
          setSchedule(defaultSched);
        } else {
          setSchedule(res.data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchAvailability();
  }, []);

  const handleCheckbox = (dayIndex, checked) => {
    if (checked) {
      setSchedule([...schedule, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' }]);
    } else {
      setSchedule(schedule.filter(s => s.dayOfWeek !== dayIndex));
    }
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setSchedule(schedule.map(s => s.dayOfWeek === dayIndex ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    try {
      await api.post('/availability', { availability: schedule });
      alert('Availability saved!');
    } catch (error) {
      alert('Failed to save');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card max-w-2xl animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Set your availability</h2>
        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DAYS.map((day, index) => {
          const isAvailable = schedule.some(s => s.dayOfWeek === index);
          const daySettings = schedule.find(s => s.dayOfWeek === index) || { startTime: '09:00', endTime: '17:00' };

          return (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 0 10px rgba(255,255,255,0.05)' } }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={isAvailable} 
                  onChange={(e) => handleCheckbox(index, e.target.checked)} 
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
                {day}
              </label>

              {isAvailable ? (
                <>
                  <input type="time" value={daySettings.startTime} onChange={e => handleTimeChange(index, 'startTime', e.target.value)} />
                  <input type="time" value={daySettings.endTime} onChange={e => handleTimeChange(index, 'endTime', e.target.value)} />
                </>
              ) : (
                <div style={{ gridColumn: 'span 2', color: 'var(--text-secondary)' }}>Unavailable</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
