
import { LogEntry, User, ThemeType } from './types';

const STORAGE_KEY = 'space_logger_data';
const AUTH_KEY = 'space_logger_auth';
const USERS_DB_KEY = 'space_logger_users_db';
const THEME_KEY = 'space_logger_theme';

export const saveLogs = (logs: LogEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const getLogs = (): LogEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    // 同時にユーザーDBも更新
    updateUserInDB(user);
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};

// ユーザーデータベース管理
export const getUsersDB = (): User[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (user: User) => {
  const db = getUsersDB();
  const exists = db.find(u => u.email === user.email);
  if (exists) return false;
  db.push(user);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  return true;
};

export const updateUserInDB = (updatedUser: User) => {
  const db = getUsersDB();
  const index = db.findIndex(u => u.id === updatedUser.id || u.email === updatedUser.email);
  if (index !== -1) {
    db[index] = { ...db[index], ...updatedUser };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  }
};

// テーマ管理
export const saveTheme = (theme: ThemeType) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): ThemeType => {
  return (localStorage.getItem(THEME_KEY) as ThemeType) || 'dark';
};

// Initial Mock Data
export const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    title: 'React Hooks Deep Dive',
    duration: '2時間',
    tags: ['React'],
    memo: 'useEffectのクリーンアップ関数について深く学んだ。',
    timestamp: new Date().toISOString(),
    category: 'Frontend'
  }
];
