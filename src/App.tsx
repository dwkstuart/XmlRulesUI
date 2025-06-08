import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import EditBursaryPage from './components/EditBursaryPage';
import BursaryFormPage from './components/BursaryFormPage';
import SearchPage from './components/SearchPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<BursaryFormPage />} />
        <Route path="/edit/:id" element={<EditBursaryPageWrapper />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
};

// Wrapper to extract :id param and pass as prop
const EditBursaryPageWrapper: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EditBursaryPage bursaryId={Number(id)} onBack={() => navigate('/search')} />;
};

export default App;
