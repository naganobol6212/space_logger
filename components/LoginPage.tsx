
import React, { useState } from 'react';
import {
  getOrCreateUserFromSession,
  isSupabaseConfigured,
  signInWithPassword,
  signUpWithPassword,
  startGitHubOAuth,
} from '../supabase';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured) {
      setError('Supabase設定が未完了です。VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定してください。');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          setError('すべての項目を入力してください');
          return;
        }

        const { session } = await signUpWithPassword(email, password, name);
        if (!session) {
          setError('確認メールを送信しました。メール認証後にログインしてください。');
          return;
        }
        const appUser = await getOrCreateUserFromSession(session);
        if (!appUser) {
          setError('ユーザー情報の作成に失敗しました。');
          return;
        }
        onLogin(appUser);
      } else {
        const session = await signInWithPassword(email, password);
        const appUser = await getOrCreateUserFromSession(session);
        if (!appUser) {
          setError('ユーザー情報の取得に失敗しました。');
          return;
        }
        onLogin(appUser);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '認証に失敗しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase設定が未完了です。VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定してください。');
      return;
    }
    const redirectTo = `${window.location.origin}/login`;
    startGitHubOAuth(redirectTo);
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden isolate">
      <div className="mb-8 animate-float">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150"></div>
          <span className="material-symbols-outlined text-7xl text-primary dark:text-primary drop-shadow-[0_0_20px_rgba(245,197,24,0.6)] filled">
            rocket_launch
          </span>
        </div>
        <h1 className="text-4xl font-black mt-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-800 to-slate-500 dark:from-white dark:to-blue-300">
          SPACE LOGGER
        </h1>
        <p className="text-blue-500 dark:text-blue-300 text-[10px] mt-2 font-bold tracking-[0.2em] uppercase">
          知の深淵へ、いざ発進。未知なる星域を探索せよ。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 glass-panel bg-white/70 dark:bg-glass-dark p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-500">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">
          {isSignUp ? '新規アカウント作成' : 'ログイン'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-lg mb-4 font-bold">
            {error}
          </div>
        )}

        {isSignUp && (
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-blue-300 uppercase tracking-widest mb-1.5 ml-1">ユーザー名</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたの名前"
              className="w-full bg-slate-100 dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-3.5 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/20 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        )}

        <div className="text-left">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-blue-300 uppercase tracking-widest mb-1.5 ml-1">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full bg-slate-100 dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-3.5 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/20 focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="text-left">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-blue-300 uppercase tracking-widest mb-1.5 ml-1">パスワード</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-100 dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-3.5 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/20 focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-slate-900 font-black text-base py-4 rounded-xl shadow-[0_0_20px_rgba(242,194,79,0.3)] hover:shadow-[0_0_30px_rgba(242,194,79,0.5)] active:scale-[0.98] transition-all duration-300 mt-6"
        >
          {loading ? '処理中...' : isSignUp ? '登録する' : 'ログインする'}
        </button>

        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full bg-slate-800 text-white font-bold text-sm py-3 rounded-xl border border-white/10 hover:bg-slate-700 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">hub</span>
          GitHubでログイン
        </button>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-blue-500 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? '既にアカウントをお持ちですか？ ログイン' : 'アカウントをお持ちでないですか？ 新規登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
