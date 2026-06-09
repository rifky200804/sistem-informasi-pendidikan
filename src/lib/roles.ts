import { User } from '@/types/auth';

export type AppRole = 'admin' | 'kepala_sekolah' | 'guru' | string;

export const normalizeRole = (role?: string | null) =>
  (role || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const getCurrentRole = (): string => normalizeRole(getCurrentUser()?.role);

const routeAccess: Record<string, AppRole[]> = {
  '/': ['admin', 'kepala_sekolah', 'guru'],
  '/teachers': ['admin', 'kepala_sekolah'],
  '/students': ['admin', 'kepala_sekolah', 'guru'],
  '/documents': ['admin', 'kepala_sekolah', 'guru'],
  '/anecdotes': ['admin', 'kepala_sekolah', 'guru'],
  '/progress-reports': ['admin', 'kepala_sekolah', 'guru'],
  '/ape': ['admin', 'kepala_sekolah', 'guru'],
  '/report-templates': ['admin', 'kepala_sekolah', 'guru'],
  '/soal': ['admin', 'kepala_sekolah', 'guru'],
  '/activity-logs': ['admin'],
  '/settings': ['admin'],
};

export const canAccess = (path: string, role?: string | null) => {
  const normalizedRole = normalizeRole(role);
  const allowedRoles = routeAccess[path];
  if (!allowedRoles) {
    return Boolean(normalizedRole);
  }
  return allowedRoles.includes(normalizedRole);
};
