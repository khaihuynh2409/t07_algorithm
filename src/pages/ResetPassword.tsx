import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useStore();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Liên kết không hợp lệ hoặc đã hết hạn!</h2>
        <button className="btn btn-primary" onClick={() => navigate('/auth?mode=login')} style={{ marginTop: '1rem' }}>Về trang đăng nhập</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(token, newPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/auth?mode=login');
      }, 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          Tạo mật khẩu mới
        </h2>

        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255, 77, 79, 0.3)' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(82, 196, 26, 0.1)', color: '#52c41a', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(82, 196, 26, 0.3)' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading || !!success} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
            {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};
