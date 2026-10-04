import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { Trash2, Edit, Plus, Save, X, Shield, Users, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Problem } from '../mockData';

export const Admin = () => {
  const { problems, addProblem, deleteProblem, updateProblem, users, promoteToAdmin, currentUser, fetchUsers } = useStore();
  const navigate = useNavigate();

  // Protect route & fetch users
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [currentUser, navigate, fetchUsers]);

  const [activeTab, setActiveTab] = useState<'problems' | 'users'>('problems');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Problem>>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Trạng thái cho Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Thông báo số lượng tài khoản chờ duyệt
  useEffect(() => {
    if (users && users.length > 0) {
      const pendingCount = users.filter(u => u.status === 'pending').length;
      if (pendingCount > 0) {
        toast(`Có ${pendingCount} tài khoản đang chờ phê duyệt!`, {
          id: 'pending-users-alert', // Thêm ID để ngăn chặn việc hiện nhiều thông báo trùng lặp
          icon: '🔔',
          duration: 5000,
        });
      }
    }
  }, [users]);

  const handleEdit = (problem: Problem) => {
    setIsEditing(problem.id);
    setFormData(problem);
  };

  const handleSaveEdit = () => {
    if (isEditing && formData.id) {
      updateProblem(isEditing, formData as Problem);
      setIsEditing(null);
    }
  };

  const handleAdd = () => {
    if (formData.id && formData.title) {
      addProblem({
        id: formData.id,
        title: formData.title,
        difficulty: formData.difficulty || 'Easy',
        solvedCount: formData.solvedCount || 0,
        tags: formData.tags || [],
      } as Problem);
      setIsAdding(false);
      setFormData({});
    }
  };

  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Bảng quản trị hệ thống</h1>
      </div>

      {/* Modal Xác Nhận (Confirm Modal) */}
      {confirmModal.isOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="animate-fade-in" style={{
            padding: '2.5rem 2rem',
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
            }}>
              <AlertCircle size={36} color="var(--primary)" />
            </div>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: '0 0 2rem', color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                style={{ flex: 1, padding: '0.75rem', fontWeight: 600 }}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                style={{ flex: 1, padding: '0.75rem', fontWeight: 600 }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'problems' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('problems')}
        >
          <BookOpen size={18} /> Quản lý bài tập
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ position: 'relative' }}
        >
          <Users size={18} /> Quản lý người dùng
          {users && users.filter(u => u.status === 'pending').length > 0 && (
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
              {users.filter(u => u.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'problems' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => { setIsAdding(true); setFormData({}); }}
              disabled={isAdding}
            >
              <Plus size={18} /> Thêm bài tập
            </button>
          </div>
          <div className="glass-panel table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Độ khó</th>
                  <th>Số người giải</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr>
                    <td>
                      <input
                        type="text"
                        placeholder="VD: BAI01"
                        value={formData.id || ''}
                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                        style={{ padding: '0.5rem', width: '100px', background: 'var(--surface)' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Tên bài tập..."
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem', width: '100%', background: 'var(--surface)' }}
                      />
                    </td>
                    <td>
                      <select
                        value={formData.difficulty || 'Easy'}
                        onChange={e => setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                        className="filter-select"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.solvedCount || 0}
                        onChange={e => setFormData({ ...formData, solvedCount: parseInt(e.target.value) || 0 })}
                        style={{ padding: '0.5rem', width: '80px', background: 'var(--surface)' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success" onClick={handleAdd} style={{ padding: '0.5rem' }}><Save size={16} /></button>
                        <button className="btn btn-secondary" onClick={() => setIsAdding(false)} style={{ padding: '0.5rem' }}><X size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )}

                {problems.map((p) => (
                  <tr key={p.id}>
                    {isEditing === p.id ? (
                      <>
                        <td>{p.id}</td>
                        <td>
                          <input
                            type="text"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={{ padding: '0.5rem', width: '100%', background: 'var(--surface)' }}
                          />
                        </td>
                        <td>
                          <select
                            value={formData.difficulty || 'Easy'}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                            className="filter-select"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={formData.solvedCount || 0}
                            onChange={e => setFormData({ ...formData, solvedCount: parseInt(e.target.value) || 0 })}
                            style={{ padding: '0.5rem', width: '80px', background: 'var(--surface)' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-success" onClick={handleSaveEdit} style={{ padding: '0.5rem' }}><Save size={16} /></button>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(null)} style={{ padding: '0.5rem' }}><X size={16} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 500 }}>{p.id}</td>
                        <td>{p.title}</td>
                        <td>
                          <span className={`difficulty-badge diff-${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.solvedCount}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleEdit(p)}
                              style={{ padding: '0.5rem' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Xóa bài tập',
                                  message: `Bạn có chắc chắn muốn xóa bài tập ${p.id} không? Hành động này không thể hoàn tác.`,
                                  onConfirm: () => {
                                    deleteProblem(p.id);
                                    toast.success(`Đã xóa bài tập ${p.id}`);
                                  }
                                });
                              }}
                              style={{ padding: '0.5rem', color: '#ff4d4f' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {selectedUsers.length > 0 && (
            <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
              <span style={{ alignSelf: 'center', fontWeight: 600 }}>Đã chọn {selectedUsers.length} tài khoản:</span>
              <button
                className="btn btn-success"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Phê duyệt hàng loạt',
                    message: `Bạn có chắc chắn muốn phê duyệt ${selectedUsers.length} tài khoản đã chọn?`,
                    onConfirm: async () => {
                      await useStore.getState().bulkApproveUsers(selectedUsers);
                      setSelectedUsers([]);
                      toast.success(`Đã phê duyệt ${selectedUsers.length} tài khoản`);
                    }
                  });
                }}
              >
                ✅ Phê duyệt tất cả
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Từ chối hàng loạt',
                    message: `Bạn có chắc chắn muốn TỪ CHỐI ${selectedUsers.length} tài khoản đã chọn? Các tài khoản này sẽ bị XÓA khỏi hệ thống.`,
                    onConfirm: async () => {
                      await useStore.getState().bulkRejectUsers(selectedUsers);
                      setSelectedUsers([]);
                      toast.success(`Đã từ chối ${selectedUsers.length} tài khoản`);
                    }
                  });
                }}
              >
                ❌ Từ chối tất cả (Xóa)
              </button>
            </div>
          )}
          <div className="glass-panel table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.filter(u => u.status === 'pending').map(u => u.studentId));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={users.filter(u => u.status === 'pending').length > 0 && selectedUsers.length === users.filter(u => u.status === 'pending').length}
                    />
                  </th>
                  <th>MSSV</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Email</th>
                  <th>Quyền hạn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.studentId}>
                    <td style={{ textAlign: 'center' }}>
                      {u.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.studentId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, u.studentId]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== u.studentId));
                            }
                          }}
                        />
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{u.studentId}</td>
                    <td>{u.fullName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</span>}</td>
                    <td>{u.className || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</span>}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`difficulty-badge diff-${u.role === 'admin' ? 'hard' : 'easy'}`}>
                        {u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td>
                      <span className={`difficulty-badge diff-${u.status === 'approved' ? 'easy' : u.status === 'rejected' ? 'hard' : 'medium'}`}>
                        {u.status === 'approved' ? 'Đã duyệt' : u.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {u.status === 'pending' && (
                          <select
                            className="filter-select"
                            defaultValue=""
                            onChange={(e) => {
                              const action = e.target.value;
                              e.target.value = ""; // Reset
                              if (action === 'approve') {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Phê duyệt tài khoản',
                                  message: `Bạn có muốn phê duyệt tài khoản sinh viên ${u.studentId}?`,
                                  onConfirm: async () => {
                                    await useStore.getState().approveUser(u.studentId);
                                    toast.success(`Đã phê duyệt ${u.studentId}`);
                                  }
                                });
                              } else if (action === 'reject') {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Từ chối tài khoản',
                                  message: `Bạn có chắc chắn muốn TỪ CHỐI tài khoản sinh viên ${u.studentId}? Tài khoản này sẽ không thể đăng nhập.`,
                                  onConfirm: async () => {
                                    await useStore.getState().rejectUser(u.studentId);
                                    toast.success(`Đã từ chối ${u.studentId}`);
                                  }
                                });
                              }
                            }}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', fontWeight: 500, background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          >
                            <option value="" disabled>Hành động</option>
                            <option value="approve">✅ Phê duyệt</option>
                            <option value="reject">❌ Từ chối</option>
                          </select>
                        )}
                        {u.role !== 'admin' && u.status === 'approved' && (
                          <select
                            className="filter-select"
                            defaultValue=""
                            onChange={(e) => {
                              const action = e.target.value;
                              e.target.value = ""; // Reset
                              if (action === 'promote') {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Bổ nhiệm Quản trị viên',
                                  message: `Bạn có chắc chắn muốn ${u.studentId} làm Quản trị viên?`,
                                  onConfirm: async () => {
                                    await promoteToAdmin(u.studentId);
                                    toast.success(`Đã bổ nhiệm ${u.studentId} làm Admin`);
                                  }
                                });
                              } else if (action === 'delete') {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Xóa người dùng',
                                  message: `Bạn có chắc chắn muốn xóa tài khoản ${u.studentId}? Toàn bộ dữ liệu của người dùng này sẽ bị mất.`,
                                  onConfirm: async () => {
                                    await useStore.getState().deleteUser(u.studentId);
                                    toast.success(`Đã xóa tài khoản ${u.studentId}`);
                                  }
                                });
                              }
                            }}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', fontWeight: 500, background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          >
                            <option value="" disabled>Hành động</option>
                            <option value="promote">Bổ nhiệm Admin</option>
                            <option value="delete">Xóa tài khoản</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )
      }
    </div >
  );
};
