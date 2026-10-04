import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Medal, Award } from 'lucide-react';

export const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard } = useStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy size={24} color="#fbbf24" />; // Gold
    if (index === 1) return <Medal size={24} color="#94a3b8" />; // Silver
    if (index === 2) return <Medal size={24} color="#b45309" />; // Bronze
    return <span style={{ fontWeight: 'bold', color: '#64748b', fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{index + 1}</span>;
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <Trophy size={36} color="var(--primary)" />
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1e293b' }}>Bảng xếp hạng</h1>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', textAlign: 'center', width: '80px', color: '#64748b' }}>Hạng</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Học viên</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Lớp</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>Điểm số</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Chưa có dữ liệu xếp hạng.
                </td>
              </tr>
            ) : (
              leaderboard.map((user, index) => (
                <tr 
                  key={user.studentId} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9', 
                    background: index < 3 ? 'rgba(59, 130, 246, 0.03)' : '#ffffff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = index < 3 ? 'rgba(59, 130, 246, 0.03)' : '#ffffff'}
                >
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={user.avatarUrl ? `http://${window.location.hostname}:5000${user.avatarUrl}` : `https://api.dicebear.com/7.x/identicon/svg?seed=${user.studentId}&backgroundColor=b6e3f4`} 
                        alt="Avatar" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>
                          {user.fullName || user.studentId}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: '#475569' }}>
                    {user.className || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                      {user.score || 0}
                      <Award size={18} color="var(--primary)" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
