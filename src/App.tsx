import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { ProblemList } from './pages/ProblemList';
import { ProblemDetail } from './pages/ProblemDetail';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { ResetPassword } from './pages/ResetPassword';
import { useStore } from './store/useStore';
import './index.css';

function App() {
  const { fetchProblems } = useStore();

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return (
    <Router>
      <div className="app-container">
        <Toaster position="bottom-right" toastOptions={{ 
          style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.1)' }
        }} />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
