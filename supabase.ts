import { LogEntry, User } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SESSION_KEY = 'space_logger_supabase_session';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: AuthUser;
}

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  streak: number | null;
  github_username: string | null;
  github_repo: string | null;
  github_token: string | null;
}

interface LogRow {
  id: string;
  user_id: string;
  title: string;
  duration: string;
  duration_minutes: number;
  learning_type: 'input' | 'output' | 'both' | null;
  tags: string[] | null;
  memo: string;
  timestamp: string;
  category: 'Frontend' | 'Backend' | 'Infrastructure' | 'Design';
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const ensureConfig = () => {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return { SUPABASE_URL, SUPABASE_ANON_KEY };
};

const authHeaders = (accessToken?: string) => {
  const { SUPABASE_ANON_KEY } = ensureConfig();
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
};

const mapProfileToUser = (profile: ProfileRow | null, authUser: AuthUser): User => {
  const metadataName = typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name : '';
  const metadataAvatar = typeof authUser.user_metadata?.avatar_url === 'string' ? authUser.user_metadata.avatar_url : '';
  return {
    id: authUser.id,
    name: profile?.name || metadataName || 'Space Pilot',
    email: profile?.email || authUser.email || '',
    avatar: profile?.avatar || metadataAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
    streak: profile?.streak ?? 0,
    githubUsername: profile?.github_username || undefined,
    githubRepo: profile?.github_repo || undefined,
    githubToken: profile?.github_token || undefined,
  };
};

const mapLogRowToEntry = (row: LogRow): LogEntry => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  duration: row.duration,
  durationMinutes: row.duration_minutes,
  learningType: row.learning_type || 'both',
  tags: Array.isArray(row.tags) ? row.tags : [],
  memo: row.memo || '',
  timestamp: row.timestamp,
  category: row.category || 'Frontend',
});

const mapEntryToLogRow = (entry: LogEntry, userId: string): LogRow => ({
  id: entry.id,
  user_id: userId,
  title: entry.title,
  duration: entry.duration,
  duration_minutes: Number.isFinite(entry.durationMinutes) ? entry.durationMinutes : 0,
  learning_type: entry.learningType || 'both',
  tags: entry.tags || [],
  memo: entry.memo || '',
  timestamp: entry.timestamp,
  category: entry.category || 'Frontend',
});

export const getStoredSession = (): AuthSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const signOutSupabase = async () => {
  if (!isSupabaseConfigured) return;
  const session = getStoredSession();
  const { SUPABASE_URL } = ensureConfig();
  if (session?.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: authHeaders(session.access_token),
    });
  }
  saveSession(null);
};

export const startGitHubOAuth = (redirectTo: string) => {
  const { SUPABASE_URL } = ensureConfig();
  const url = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectTo)}`;
  window.location.assign(url);
};

export const hydrateSessionFromUrl = async (): Promise<AuthSession | null> => {
  if (!isSupabaseConfigured) return null;
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token') || undefined;
  const expiresIn = Number(params.get('expires_in') || 0) || undefined;
  if (!accessToken) return null;

  const user = await fetchAuthUser(accessToken);
  const nextSession: AuthSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    user: user || undefined,
  };
  saveSession(nextSession);
  if (window.location.hash) {
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  }
  return nextSession;
};

export const signInWithPassword = async (email: string, password: string): Promise<AuthSession> => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.msg || 'ログインに失敗しました');
  const session: AuthSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user: data.user,
  };
  saveSession(session);
  return session;
};

export const signUpWithPassword = async (email: string, password: string, name: string) => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password, data: { name } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.msg || '新規登録に失敗しました');

  const session: AuthSession | null = data?.access_token ? {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user: data.user,
  } : null;
  saveSession(session);
  return { session, user: data.user as AuthUser | undefined };
};

export const fetchAuthUser = async (accessToken: string): Promise<AuthUser | null> => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) return null;
  return (await res.json()) as AuthUser;
};

export const getAccessToken = (): string | null => {
  const session = getStoredSession();
  return session?.access_token || null;
};

export const getProfile = async (userId: string, accessToken: string): Promise<ProfileRow | null> => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`, {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error('プロフィールの取得に失敗しました');
  const rows = await res.json() as ProfileRow[];
  return rows[0] || null;
};

export const upsertProfile = async (user: User, accessToken: string): Promise<ProfileRow> => {
  const { SUPABASE_URL } = ensureConfig();
  const payload = [{
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    streak: user.streak ?? 0,
    github_username: user.githubUsername || null,
    github_repo: user.githubRepo || null,
    github_token: user.githubToken || null,
  }];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`プロフィール保存に失敗しました: ${errorText}`);
  }
  const rows = await res.json() as ProfileRow[];
  return rows[0];
};

export const getOrCreateUserFromSession = async (session: AuthSession): Promise<User | null> => {
  if (!session.access_token) return null;
  const authUser = session.user || await fetchAuthUser(session.access_token);
  if (!authUser) return null;

  const existingProfile = await getProfile(authUser.id, session.access_token);
  if (existingProfile) {
    return mapProfileToUser(existingProfile, authUser);
  }

  const newUser: User = {
    id: authUser.id,
    name: (authUser.user_metadata?.name as string) || 'Space Pilot',
    email: authUser.email || '',
    avatar: (authUser.user_metadata?.avatar_url as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
    streak: 0,
  };
  await upsertProfile(newUser, session.access_token);
  return newUser;
};

export const fetchLogsFromSupabase = async (userId: string, accessToken: string): Promise<LogEntry[]> => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/logs?user_id=eq.${encodeURIComponent(userId)}&select=*&order=timestamp.desc`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) throw new Error('ログの取得に失敗しました');
  const rows = await res.json() as LogRow[];
  return rows.map(mapLogRowToEntry);
};

export const createLogInSupabase = async (entry: LogEntry, userId: string, accessToken: string) => {
  const { SUPABASE_URL } = ensureConfig();
  const payload = [mapEntryToLogRow(entry, userId)];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ログ作成に失敗しました: ${errorText}`);
  }
};

export const updateLogInSupabase = async (logId: string, userId: string, patch: Partial<LogEntry>, accessToken: string) => {
  const { SUPABASE_URL } = ensureConfig();
  const dbPatch: Partial<LogRow> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.duration !== undefined) dbPatch.duration = patch.duration;
  if (patch.durationMinutes !== undefined) dbPatch.duration_minutes = Number.isFinite(patch.durationMinutes) ? patch.durationMinutes : 0;
  if (patch.learningType !== undefined) dbPatch.learning_type = patch.learningType;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.memo !== undefined) dbPatch.memo = patch.memo;
  if (patch.timestamp !== undefined) dbPatch.timestamp = patch.timestamp;
  if (patch.category !== undefined) dbPatch.category = patch.category;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/logs?id=eq.${encodeURIComponent(logId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(dbPatch),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ログ更新に失敗しました: ${errorText}`);
  }
};

export const deleteLogInSupabase = async (logId: string, userId: string, accessToken: string) => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/logs?id=eq.${encodeURIComponent(logId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ログ削除に失敗しました: ${errorText}`);
  }
};
