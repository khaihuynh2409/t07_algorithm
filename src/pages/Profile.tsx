import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, Save, Mail, CreditCard, BookOpen, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { currentUser, updateProfile } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [className, setClassName] = useState(currentUser?.className || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth?mode=login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await updateProfile({ fullName, className });
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const res = await useStore.getState().uploadAvatar(file);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <label style={{ cursor: 'pointer', position: 'relative' }} title="Nhấn để đổi ảnh đại diện">
            <input
              type="file"
              accept="image/jpeg, image/png, image/gif, image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <img
              src={currentUser.avatarUrl ? `http://${window.location.hostname}:5000${currentUser.avatarUrl}` : `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.studentId}&backgroundColor=b6e3f4`}
              alt="Avatar"
              style={{ width: '80px', height: '80px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: -5, right: -5, background: '#ffffff',
              borderRadius: '50%', padding: '4px', border: '1px solid #cbd5e1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Edit2 size={12} color="#64748b" />
            </div>
          </label>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>Hồ sơ của bạn</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Học viện Kỹ thuật và Công nghệ an ninh</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ flex: '0 0 140px', color: '#334155', fontSize: '1rem' }}>
              Mã sinh viên:
            </label>
            <input
              type="text"
              value={currentUser.studentId}
              disabled
              style={{ flex: 1, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ flex: '0 0 140px', color: '#334155', fontSize: '1rem' }}>
              Email:
            </label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              style={{ flex: 1, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ flex: '0 0 140px', color: '#334155', fontSize: '1rem' }}>
              Họ và tên:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ flex: 1, background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ flex: '0 0 140px', color: '#334155', fontSize: '1rem' }}>
              Lớp:
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              style={{ flex: 1, background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
