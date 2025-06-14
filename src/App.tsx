import React from 'react';
import { Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import EditBursaryPage from './components/EditBursaryPage';
import BursaryFormPage from './components/BursaryFormPage';
import SearchPage from './components/SearchPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import { Button, Box } from '@mui/material';

const App: React.FC = () => {
  const [user, setUser] = React.useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check for user in localStorage
    const stored = localStorage.getItem('user');
    if (stored) setUser(stored);
  }, []);

  // Protect all routes except /login and /register
  React.useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [user, location, navigate]);

  return (
    <>
      {/* Heading banner with username if logged in */}
      <Box sx={{ p: 2, background: '#f5f5f5', borderBottom: '1px solid #ddd', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <span style={{ fontWeight: 600, fontSize: 20 }}>Bursary Awards App</span>
        </Box>
        {user && (
          <Box sx={{ fontWeight: 500, fontSize: 16, color: 'primary.main' }}>Welcome, {user}!</Box>
        )}
      </Box>
      {/* Show login/register or logout button */}
      <Box sx={{ p: 2, textAlign: 'right' }}>
        {!user ? (
          <>
            <Button component={Link} to="/login" sx={{ mr: 1 }}>Login</Button>
            <Button component={Link} to="/register">Register</Button>
          </>
        ) : (
          <Button onClick={() => { setUser(null); localStorage.removeItem('user'); navigate('/login'); }} color="secondary">Logout</Button>
        )}
      </Box>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={u => { setUser(u); localStorage.setItem('user', u); }} />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected routes */}
        {user && <Route path="/" element={<HomePage />} />}
        {user && <Route path="/create" element={<BursaryFormPage />} />}
        {user && <Route path="/edit/:id" element={<EditBursaryPageWrapper />} />}
        {user && <Route path="/search" element={<SearchPage />} />}
        {/* Fallback: redirect to login if not logged in */}
        <Route path="*" element={user ? <HomePage /> : <LoginPage onLogin={u => { setUser(u); localStorage.setItem('user', u); }} />} />
      </Routes>
    </>
  );
};

// Wrapper to extract :id param and pass as prop
const EditBursaryPageWrapper: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EditBursaryPage bursaryId={id!} onBack={() => navigate('/search')} />;
};

export default App;
