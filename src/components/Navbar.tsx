import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Trophy, User, Settings, LogOut, UserPlus, Award } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, users, fetchUsers } = useStore();
  
  React.useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pendingCount = users ? users.filter(u => u.status === 'pending').length : 0;

  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-link" style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
          <img src="/app_icon.ico" alt="ASET Logo" style={{ width: '28px', height: '28px' }} />
          ASET
        </Link>
        <div className="nav-links">
          <Link to="/problems" className={`nav-link ${location.pathname === '/problems' ? 'active' : ''}`}>
            <Terminal size={18} /> Bài tập
          </Link>
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} style={{ position: 'relative' }}>
              <Settings size={18} /> Quản trị
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-10px',
                  background: '#ff0000',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: 1,
                  boxShadow: '0 0 12px rgba(255, 0, 0, 0.8)',
                  animation: 'pulse 1.5s infinite'
                }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <Link to="#" className="nav-link">
            <Trophy size={18} /> Kỳ thi
          </Link>
          <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
            <Award size={18} /> Bảng xếp hạng
          </Link>
          
          {currentUser ? (
            <div 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
              onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            >
              <img 
                src={currentUser.avatarUrl ? `http://${window.location.hostname}:5000${currentUser.avatarUrl}` : `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.studentId}&backgroundColor=b6e3f4`} 
                alt="Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', objectFit: 'cover' }} 
              />
              <span style={{ fontWeight: 600, color: '#334155' }}>
                Xin chào, {currentUser.className && currentUser.fullName ? `${currentUser.className}_${currentUser.fullName}` : currentUser.studentId}.
              </span>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', 
                  background: '#ffffff', borderRadius: '8px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                  border: '1px solid #e2e8f0', padding: '0.5rem', minWidth: '180px', zIndex: 100
                }}>
                  <Link 
                    to="/profile"
                    onClick={() => setShowDropdown(false)} 
                    style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#1e293b', textDecoration: 'none', borderRadius: '6px', fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Chỉnh sửa hồ sơ
                  </Link>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '0.25rem 0' }}></div>
                  <div 
                    onClick={handleLogout}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', fontWeight: 500 }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/auth?mode=login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <User size={16} /> Đăng nhập
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <UserPlus size={16} /> Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
