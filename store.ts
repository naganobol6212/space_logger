
import { LogEntry, User, ThemeType } from './types';
import { getTagById } from './constants/tags';
import { getAccessToken } from './supabase';

const STORAGE_KEY = 'space_logger_data';
const AUTH_KEY = 'space_logger_auth';
const USERS_DB_KEY = 'space_logger_users_db';
const THEME_KEY = 'space_logger_theme';

const logsKeyForUser = (userId?: string) =>
  userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;

export const saveLogs = (logs: LogEntry[], userId?: string) => {
  localStorage.setItem(logsKeyForUser(userId), JSON.stringify(logs));
};

export const getLogs = (userId?: string): LogEntry[] => {
  // ユーザー指定がない場合は旧仕様（共通キー）をそのまま返す
  if (!userId) {
    const legacy = localStorage.getItem(STORAGE_KEY);
    return legacy ? JSON.parse(legacy) : [];
  }

  const key = logsKeyForUser(userId);
  const userData = localStorage.getItem(key);
  if (userData) return JSON.parse(userData);

  // 旧データがあれば、現在のユーザーの領域にマイグレーションしてから返す
  const legacy = localStorage.getItem(STORAGE_KEY);
  if (legacy) {
    const parsed: LogEntry[] = JSON.parse(legacy);
    saveLogs(parsed, userId);
    localStorage.removeItem(STORAGE_KEY);
    return parsed;
  }

  return [];
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

const CUSTOM_TAGS_KEY = 'space_logger_custom_tags';

// ... (existing helper functions)

// カスタムタグ管理
export const getCustomTags = (): string[] => {
  const data = localStorage.getItem(CUSTOM_TAGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addCustomTag = (tag: string) => {
  const tags = getCustomTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(tags));
  }
};

export const removeCustomTag = (tag: string) => {
  const tags = getCustomTags();
  const newTags = tags.filter(t => t !== tag);
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(newTags));
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
    durationMinutes: 120,
    tags: ['react'],
    memo: 'useEffectのクリーンアップ関数について深く学んだ。',
    timestamp: new Date().toISOString(),
    category: 'Frontend'
  }
];

export type SyncResult = {
  success: boolean;
  message: string;
  code?: 'MISSING_SCOPE' | 'REPO_NOT_FOUND' | 'OAUTH_EXPIRED' | 'ALREADY_SYNCED' | 'AUTH_ERROR';
};

export const syncLogToGitHub = async (
  _user: User,
  entry: LogEntry | null
): Promise<SyncResult> => {
  if (!entry) return { success: false, code: 'AUTH_ERROR', message: '同期対象の学習記録がありません。' };

  const supabaseJwt = await getAccessToken();
  if (!supabaseJwt) return { success: false, code: 'AUTH_ERROR', message: 'ログイン状態を確認できませんでした。' };

  const tagLabels = entry.tags.map(id => getTagById(id).label).join(', ');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/sync-github`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entry, tagLabels }),
    });
    return await res.json() as SyncResult;
  } catch (error) {
    return { success: false, code: 'AUTH_ERROR', message: `ネットワークエラー: ${error}` };
  }
};
