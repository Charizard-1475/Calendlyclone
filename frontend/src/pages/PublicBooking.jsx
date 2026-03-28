import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { format, addMinutes, isBefore, startOfToday, parse, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Globe, CheckCircle } from 'lucide-react';

export default function PublicBooking() {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  
  const [eventType, setEventType] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [formParams, setFormParams] = useState({ name: '', email: '' });
  const [bookingSuccess, setBookingSuccess] = useState(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/public/users/${username}/events/${slug}`);
        setEventType(res.data.event);
        setAvailability(res.data.availability);
        setMeetings(res.data.existingBookings);
      } catch (err) {
        setError('Event or host not found.');
      }
      setLoading(false);
    };
    fetchDetails();
  }, [username, slug]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTime || !selectedDate) return;
    
    try {
      const endTime = addMinutes(selectedTime, eventType.duration);
      const res = await api.post('/public/bookings', {
        eventTypeId: eventType.id,
        inviteeName: formParams.name,
        inviteeEmail: formParams.email,
        startTime: selectedTime.toISOString(),
        endTime: endTime.toISOString()
      });
      setBookingSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
      const getRes = await api.get(`/public/users/${username}/events/${slug}`);
      setMeetings(getRes.data.existingBookings);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center' }}>Loading...</div>;
  if (error || !eventType) return <div className="container" style={{ textAlign: 'center' }}>{error}</div>;

  if (bookingSuccess) {
    return (
      <div className="card text-center animate-fade" style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem 2rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>You are scheduled</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>A calendar invitation has been sent to your email address.</p>
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem' }}>{eventType.name}</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <CalendarIcon size={18} /> {format(new Date(bookingSuccess.startTime), 'EEEE, MMMM d, yyyy')}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <Clock size={18} /> {format(new Date(bookingSuccess.startTime), 'h:mm a')} - {format(new Date(bookingSuccess.endTime), 'h:mm a')}
          </p>
        </div>
      </div>
    );
  }

  // Generate calendar days
  const startDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startingDayOfWeek = startDayOfMonth.getDay();
  
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  let availableSlots = [];
  if (selectedDate) {
    const dayOfWeek = selectedDate.getDay();
    const dayAvail = availability.find(a => a.dayOfWeek === dayOfWeek);
    if (dayAvail) {
      const startSlot = parse(dayAvail.startTime, 'HH:mm', selectedDate);
      const endSlot = parse(dayAvail.endTime, 'HH:mm', selectedDate);
      
      let currentSlot = startSlot;
      while (isBefore(addMinutes(currentSlot, eventType.duration), endSlot) || currentSlot.getTime() + (eventType.duration*60000) === endSlot.getTime()) {
        const slotEnd = addMinutes(currentSlot, eventType.duration);
        
        if (!isBefore(currentSlot, new Date())) {
          const hasOverlap = meetings.some(m => {
            if (m.status !== 'CONFIRMED') return false;
            const mStart = new Date(m.startTime);
            const mEnd = new Date(m.endTime);
            return (currentSlot < mEnd && slotEnd > mStart);
          });
          if (!hasOverlap) availableSlots.push(currentSlot);
        }
        currentSlot = slotEnd;
      }
    }
  }

  return (
    <div className="card animate-fade" style={{ maxWidth: '1000px', margin: '2rem auto', padding: 0, display: 'flex', overflow: 'hidden' }}>
      
      <div style={{ padding: '2rem', borderRight: '1px solid var(--border)', flex: '1', minWidth: '300px', backgroundColor: 'var(--bg-surface)' }}>
        <Link to={`/book/${username}`} style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'inline-block' }}>
          <ChevronLeft size={16} /> Back to {username}'s page
        </Link>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', marginTop: '1rem' }}>{eventType.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <Clock size={20} />
          {eventType.duration} min
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
          <Globe size={20} />
          Local Time
        </div>
        {selectedDate && selectedTime && (
          <div style={{ marginTop: '2rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <CalendarIcon size={18} />
             {format(selectedDate, 'MMMM d, yyyy')} <br/>
             {format(selectedTime, 'h:mm a')}
          </div>
        )}
      </div>

      <div style={{ flex: '2', padding: '2rem' }}>
        {!selectedTime ? (
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: '1' }}>
              <h3 style={{ marginBottom: '2rem' }}>Select a Date & Time</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={prevMonth} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%' }}><ChevronLeft/></button>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: '150px', textAlign: 'center' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={nextMonth} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%' }}><ChevronRight/></button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} />;
                  const isPastDay = isBefore(date, startOfToday());
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const hasAvailability = availability.some(a => a.dayOfWeek === date.getDay());
                  const canSelect = !isPastDay && hasAvailability;

                  return (
                    <button 
                      key={idx}
                      disabled={!canSelect}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        padding: '1rem 0',
                        borderRadius: '50%',
                        border: '1px solid transparent',
                        backgroundColor: isSelected ? 'var(--primary)' : canSelect ? 'rgba(255,255,255,0.05)' : 'transparent',
                        color: isSelected ? '#fff' : canSelect ? 'var(--text-primary)' : 'var(--text-secondary)',
                        opacity: canSelect ? 1 : 0.3,
                        cursor: canSelect ? 'pointer' : 'default',
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                      className={canSelect && !isSelected ? 'card-hover' : ''}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="animate-fade" style={{ width: '220px', paddingLeft: '2rem', borderLeft: '1px solid var(--border)', height: '100%', overflowY: 'auto' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{format(selectedDate, 'EEEE, MMMM d')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {availableSlots.length > 0 ? availableSlots.map((slot, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedTime(slot)}
                      className="btn btn-secondary"
                      style={{ width: '100%', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    >
                      {format(slot, 'h:mm a')}
                    </button>
                  )) : (
                    <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>No slots available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade" style={{ maxWidth: '400px' }}>
            <button 
              onClick={() => setSelectedTime(null)} 
              className="btn btn-secondary" 
              style={{ marginBottom: '2rem', padding: '0.5rem 1rem', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Enter Details</h3>
            <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                <input required value={formParams.name} onChange={e => setFormParams({...formParams, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                <input required type="email" value={formParams.email} onChange={e => setFormParams({...formParams, email: e.target.value})} />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Schedule Event</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
