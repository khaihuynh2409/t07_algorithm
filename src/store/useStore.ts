import { create } from 'zustand';
import type { Problem } from '../mockData';

export interface User {
  studentId: string;
  email: string;
  fullName?: string;
  className?: string;
  avatarUrl?: string;
  password?: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
}

interface StoreState {
  problems: Problem[];
  users: User[];
  leaderboard: User[];
  currentUser: User | null;
  token: string | null;
  fetchUsers: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchProblems: () => Promise<void>;
  addProblem: (problem: Problem) => void;
  deleteProblem: (id: string) => void;
  updateProblem: (id: string, updated: Partial<Problem>) => void;
  register: (user: Omit<User, 'role' | 'status'>) => Promise<{ success: boolean; message: string }>;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  promoteToAdmin: (studentId: string) => Promise<void>;
  approveUser: (studentId: string) => Promise<void>;
  rejectUser: (studentId: string) => Promise<void>;
  deleteUser: (studentId: string) => Promise<void>;
  bulkApproveUsers: (studentIds: string[]) => Promise<void>;
  bulkRejectUsers: (studentIds: string[]) => Promise<void>;
  updateProfile: (data: { fullName: string; className: string }) => Promise<{ success: boolean; message: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  solvedProblems: string[];
  markAsSolved: (id: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? `https://easy-tables-train.loca.lt/api`;

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const getInitialSolved = (): string[] => {
  try {
    const solvedStr = localStorage.getItem('solvedProblems');
    return solvedStr ? JSON.parse(solvedStr) : [];
  } catch {
    return [];
  }
};

export const useStore = create<StoreState>()((set, get) => ({
  problems: [],
  users: [],
  leaderboard: [],
  currentUser: getInitialUser(),
  token: localStorage.getItem('token') || null,
  solvedProblems: getInitialSolved(),

  markAsSolved: (id: string) => {
    const current = get().solvedProblems;
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem('solvedProblems', JSON.stringify(updated));
      set({ solvedProblems: updated });
    }
  },

  fetchProblems: async () => {
    try {
      const res = await fetch(`${API_URL}/problems`, {
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      const data = await res.json();
      set({ problems: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchUsers: async () => {
    try {
      const { token } = get();
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        set({ users: data });
      }
    } catch (e) {
      console.error(e);
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`, {
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        set({ leaderboard: data });
      }
    } catch (e) {
      console.error(e);
    }
  },

  addProblem: (problem) => set((state) => ({ problems: [...state.problems, problem] })), // Tạm thời client-side
  deleteProblem: (id) => set((state) => ({ problems: state.problems.filter(p => p.id !== id) })),
  updateProblem: (id, updated) => set((state) => ({
    problems: state.problems.map(p => p.id === id ? { ...p, ...updated } : p)
  })),

  register: async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ!' };
    }
  },

  login: async (identifier, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ currentUser: data.user, token: data.token });
        return { success: true, message: 'Đăng nhập thành công' };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ!' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ currentUser: null, token: null });
  },

  promoteToAdmin: async (studentId) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentId })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  approveUser: async (studentId) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentId })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  rejectUser: async (studentId) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentId })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  deleteUser: async (studentId) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentId })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  bulkApproveUsers: async (studentIds) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/bulk-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentIds })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  bulkRejectUsers: async (studentIds) => {
    try {
      const { token } = get();
      await fetch(`${API_URL}/users/bulk-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ studentIds })
      });
      get().fetchUsers();
    } catch (e) {
      console.error(e);
    }
  },

  updateProfile: async (data) => {
    try {
      const { token, currentUser } = get();
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        const updatedUser = { ...currentUser, fullName: data.fullName, className: data.className };
        set({ currentUser: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      const { token, currentUser } = get();
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_URL}/users/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }, // Bỏ Content-Type để browser tự set dạng multipart/form-data
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        const updatedUser = { ...currentUser, avatarUrl: result.avatarUrl };
        set({ currentUser: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        get().fetchUsers();
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  }
}));
