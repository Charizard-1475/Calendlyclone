import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import PublicBooking from './pages/PublicBooking';
import UserPublicProfile from './pages/UserPublicProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading authentication...</div>;
  if (!user) return <Login />;
  return children;
}

function TopNav() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const isPublic = location.pathname.startsWith('/book/');
  
  if (isPublic) return null; // No nav on public booking pages
  
  return (
    <header className="glass-header">
      <div className="header-nav">
        <Link to="/" className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={28} color="#4361ee" />
          CalendlyClone
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Event Types</Link>
              <Link to="/meetings" className={`nav-link ${location.pathname === '/meetings' ? 'active' : ''}`}>Meetings</Link>
              <Link to="/availability" className={`nav-link ${location.pathname === '/availability' ? 'active' : ''}`}>Availability</Link>
              <button className="nav-link" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: 'none' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
             <>
               <Link to="/login" className="nav-link">Login</Link>
               <Link to="/signup" className="nav-link">Sign Up</Link>
             </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TopNav />
      <main className="container animate-fade">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          
          {/* Public Sharing Routes */}
          <Route path="/book/:username" element={<UserPublicProfile />} />
          <Route path="/book/:username/:slug" element={<PublicBooking />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
