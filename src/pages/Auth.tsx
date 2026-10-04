import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogIn, UserPlus } from 'lucide-react';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, forgotPassword, currentUser } = useStore();

  const searchParams = new URLSearchParams(location.search);
  const queryMode = searchParams.get('mode');
  const [mode, setMode] = useState(queryMode === 'register' ? 'register' : 'login');
  
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [identifier, setIdentifier] = useState(''); // Cho login (Email or StudentID)

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Nếu đã đăng nhập thì về trang chủ
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Xóa thông báo khi đổi mode
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      if (!identifier || !password) {
        setError('Vui lòng nhập đầy đủ thông tin!');
        return;
      }
      const res = await login(identifier, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else if (mode === 'register') {
      if (!email || !studentId || !password || !confirmPassword || !fullName || !className) {
        setError('Vui lòng nhập đầy đủ thông tin!');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp!');
        return;
      }
      const res = await register({ email, studentId, password, fullName, className });
      if (res.success) {
        setSuccess(res.message);
        // Reset form
        setEmail('');
        setStudentId('');
        setFullName('');
        setClassName('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message);
      }
    } else if (mode === 'forgot-password') {
      if (!email) {
        setError('Vui lòng nhập email!');
        return;
      }
      setIsLoading(true);
      const res = await forgotPassword(email);
      setIsLoading(false);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {mode === 'login' ? 'Đăng nhập hệ thống' : mode === 'register' ? 'Tạo tài khoản mới' : 'Khôi phục mật khẩu'}
        </h2>

        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255, 77, 79, 0.3)' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(82, 196, 26, 0.1)', color: '#52c41a', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(82, 196, 26, 0.3)' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mode === 'forgot-password' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email đã đăng ký</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  placeholder="Nhập email của bạn..."
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => setMode('login')}>Quay lại đăng nhập</span>
              </div>
            </>
          ) : mode === 'login' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email hoặc Mã số sinh viên</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => setMode('forgot-password')}>Quên mật khẩu?</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mã số sinh viên (Bắt buộc)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Lớp</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
            {isLoading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Gửi yêu cầu đăng ký' : 'Gửi link khôi phục'}
          </button>
        </form>
      </div>
    </div>
  );
};
