import { createClient } from '@supabase/supabase-js';

const normalizeEnvValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

export const SUPABASE_URL = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL as string | undefined);
export const SUPABASE_ANON_KEY = normalizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const getSupabaseConfigDebug = () => ({
  isSupabaseConfigured,
  hasSupabaseUrl: Boolean(SUPABASE_URL),
  hasSupabaseAnonKey: Boolean(SUPABASE_ANON_KEY),
  supabaseUrlPreview: SUPABASE_URL ? SUPABASE_URL.slice(0, 40) : null,
  supabaseProjectRef: (() => {
    try {
      return SUPABASE_URL ? new URL(SUPABASE_URL).host.split('.')[0] : null;
    } catch {
      return null;
    }
  })(),
  anonProjectRef: (() => {
    try {
      if (!SUPABASE_ANON_KEY) return null;
      const parts = SUPABASE_ANON_KEY.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
      const payload = JSON.parse(atob(base64 + pad)) as { ref?: string };
      return payload.ref || null;
    } catch {
      return null;
    }
  })(),
});

type GlobalWithSupabase = typeof globalThis & {
  __spaceLoggerSupabaseClient?: ReturnType<typeof createClient>;
  __spaceLoggerSupabaseClientFingerprint?: string;
};

const g = globalThis as GlobalWithSupabase;
const fingerprint = `${SUPABASE_URL || ''}::${SUPABASE_ANON_KEY || ''}`;

export const supabase = isSupabaseConfigured
  ? (() => {
      // HMR中に env が変わった場合、古いキーを握った client を再生成する
      if (!g.__spaceLoggerSupabaseClient || g.__spaceLoggerSupabaseClientFingerprint !== fingerprint) {
        g.__spaceLoggerSupabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
          auth: {
            flowType: 'pkce',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        g.__spaceLoggerSupabaseClientFingerprint = fingerprint;
      }
      return g.__spaceLoggerSupabaseClient;
    })()
  : null;
