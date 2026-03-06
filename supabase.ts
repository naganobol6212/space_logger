import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { LogEntry, User } from './types';
import { getSupabaseConfigDebug, isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from './lib/supabaseClient';

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  streak: number | null;
  github_username: string | null;
  github_repo: string | null;
  github_access_token: string | null;
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

export { getSupabaseConfigDebug, isSupabaseConfigured };

export interface GitHubAuthStatus {
  isGithubOAuth: boolean;
  providerToken: string | null;
  oauthUsername: string | null;
}

const ensureConfig = () => {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return { SUPABASE_URL, SUPABASE_ANON_KEY };
};

const ensureSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }
  return supabase;
};

const authHeaders = (accessToken: string) => {
  const { SUPABASE_ANON_KEY } = ensureConfig();
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

const mapProfileToUser = (profile: ProfileRow | null, authUser: SupabaseAuthUser): User => {
  const metadata = authUser.user_metadata || {};
  const metadataName = typeof metadata.name === 'string' ? metadata.name : '';
  const metadataAvatar = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '';
  const metadataGitHubUsername = typeof metadata.user_name === 'string'
    ? metadata.user_name
    : typeof metadata.preferred_username === 'string'
      ? metadata.preferred_username
      : '';

  return {
    id: authUser.id,
    name: profile?.name || metadataName || 'Space Pilot',
    email: profile?.email || authUser.email || '',
    avatar: profile?.avatar || metadataAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
    streak: profile?.streak ?? 0,
    githubUsername: profile?.github_username || metadataGitHubUsername || undefined,
    githubRepo: profile?.github_repo || undefined,
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

export const getCurrentSession = async (): Promise<Session | null> => {
  if (!isSupabaseConfigured) return null;
  const client = ensureSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

const getStoredGitHubToken = async (userId: string, accessToken: string): Promise<string | null> => {
  const { SUPABASE_URL } = ensureConfig();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=github_access_token`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) return null;
  const rows = await res.json() as { github_access_token: string | null }[];
  return rows[0]?.github_access_token || null;
};

const saveGitHubTokenToProfile = async (userId: string, token: string, accessToken: string): Promise<void> => {
  const { SUPABASE_URL } = ensureConfig();
  await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ github_access_token: token }),
    }
  );
};

export const getGitHubAuthStatus = async (): Promise<GitHubAuthStatus> => {
  if (!isSupabaseConfigured) {
    return { isGithubOAuth: false, providerToken: null, oauthUsername: null };
  }

  const session = await getCurrentSession();
  const authUser = session?.user || await fetchAuthUser();
  if (!authUser) {
    return { isGithubOAuth: false, providerToken: null, oauthUsername: null };
  }

  const appProvider = typeof authUser.app_metadata?.provider === 'string'
    ? authUser.app_metadata.provider
    : null;
  const identities = Array.isArray(authUser.identities) ? authUser.identities : [];
  const githubIdentity = identities.find((identity) => identity?.provider === 'github');
  const isGithubOAuth = appProvider === 'github' || Boolean(githubIdentity);

  const identityData = githubIdentity?.identity_data as Record<string, unknown> | undefined;
  const oauthUsername = (typeof authUser.user_metadata?.user_name === 'string'
    ? authUser.user_metadata.user_name
    : typeof authUser.user_metadata?.preferred_username === 'string'
      ? authUser.user_metadata.preferred_username
      : typeof identityData?.user_name === 'string'
        ? identityData.user_name
        : typeof identityData?.login === 'string'
          ? identityData.login
          : null);

  let providerToken = typeof (session as Session & { provider_token?: string }).provider_token === 'string'
    ? (session as Session & { provider_token?: string }).provider_token!
    : null;

  // セッションにトークンがない場合はDBから取得
  if (!providerToken && session?.access_token) {
    providerToken = await getStoredGitHubToken(authUser.id, session.access_token);
  }

  return {
    isGithubOAuth,
    providerToken,
    oauthUsername,
  };
};

export const onSupabaseAuthStateChange = (callback: (session: Session | null) => void) => {
  if (!isSupabaseConfigured) return () => {};
  const client = ensureSupabaseClient();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
};

export const signOutSupabase = async () => {
  if (!isSupabaseConfigured) return;
  const client = ensureSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
};

export const startGitHubOAuth = async () => {
  const client = ensureSupabaseClient();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
      scopes: 'public_repo',
    },
  });
  if (error) throw new Error(error.message);
};

export const signInWithPassword = async (email: string, password: string): Promise<Session> => {
  const client = ensureSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('ログインセッションの取得に失敗しました');
  return data.session;
};

export const signUpWithPassword = async (email: string, password: string, name: string) => {
  const client = ensureSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) throw error;
  return { session: data.session, user: data.user };
};

export const resendConfirmationEmail = async (email: string): Promise<void> => {
  const client = ensureSupabaseClient();
  const { error } = await client.auth.resend({ type: 'signup', email });
  if (error) throw error;
};

export const fetchAuthUser = async (accessToken?: string): Promise<SupabaseAuthUser | null> => {
  const client = ensureSupabaseClient();
  const { data, error } = accessToken
    ? await client.auth.getUser(accessToken)
    : await client.auth.getUser();
  if (error) return null;
  return data.user;
};

export const getAccessToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};

export const getProfile = async (userId: string, accessToken: string): Promise<ProfileRow | null> => {
  const { SUPABASE_URL } = ensureConfig();
  const select = 'id,name,email,avatar,streak,github_username,github_repo';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent(select)}`,
    { headers: authHeaders(accessToken) }
  );
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
    console.error('プロフィール保存に失敗', await res.text());
    throw new Error('プロフィール保存に失敗しました');
  }
  const rows = await res.json() as ProfileRow[];
  return rows[0];
};

export const getOrCreateUserFromSession = async (session: Session): Promise<User | null> => {
  const authUser = session.user || await fetchAuthUser(session.access_token);
  if (!authUser) return null;

  // GitHub OAuthトークンがセッションにある場合はDBに保存
  const providerToken = (session as Session & { provider_token?: string }).provider_token;
  if (providerToken) {
    saveGitHubTokenToProfile(authUser.id, providerToken, session.access_token).catch(console.error);
  }

  try {
    const existingProfile = await getProfile(authUser.id, session.access_token);
    if (existingProfile) {
      return mapProfileToUser(existingProfile, authUser);
    }
  } catch (error) {
    console.error('Profile fetch failed. Continue with auth user fallback.', error);
  }

  const metadata = authUser.user_metadata || {};
  const newUser: User = {
    id: authUser.id,
    name: (metadata.name as string) || 'Space Pilot',
    email: authUser.email || '',
    avatar: (metadata.avatar_url as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
    streak: 0,
  };

  try {
    await upsertProfile(newUser, session.access_token);
  } catch (error) {
    console.error('Profile upsert failed. Continue with fallback user.', error);
  }

  return newUser;
};

export const fetchLogsFromSupabase = async (userId: string, accessToken: string): Promise<LogEntry[]> => {
  const { SUPABASE_URL } = ensureConfig();
  const logSelect = 'id,user_id,title,duration,duration_minutes,learning_type,tags,memo,timestamp,category';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/logs?user_id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent(logSelect)}&order=timestamp.desc`,
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
    console.error('ログ作成に失敗', await res.text());
    throw new Error('ログ作成に失敗しました');
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
    console.error('ログ更新に失敗', await res.text());
    throw new Error('ログ更新に失敗しました');
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
    console.error('ログ削除に失敗', await res.text());
    throw new Error('ログ削除に失敗しました');
  }
};
