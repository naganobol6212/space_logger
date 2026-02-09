
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, LogEntry, ThemeType } from './types';
import { getUser, saveUser, getLogs, saveLogs, getTheme, saveTheme } from './store';
import {
  createLogInSupabase,
  deleteLogInSupabase,
  fetchLogsFromSupabase,
  getAccessToken,
  getOrCreateUserFromSession,
  getStoredSession,
  hydrateSessionFromUrl,
  isSupabaseConfigured,
  signOutSupabase,
  updateLogInSupabase,
  upsertProfile,
} from './supabase';

// Components
import RecordPage from './components/RecordPage';
import HistoryPage from './components/HistoryPage';
import AnalysisPage from './components/AnalysisPage';
import SettingsPage from './components/SettingsPage';
import SuccessPage from './components/SuccessPage';
import LoginPage from './components/LoginPage';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(isSupabaseConfigured ? null : getUser());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastEntry, setLastEntry] = useState<LogEntry | null>(null);
  const [theme, setTheme] = useState<ThemeType>(getTheme());
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  const location = useLocation();
  const navigate = useNavigate();

  // テーマの適用
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Supabase セッション初期化（OAuthリダイレクト復元を含む）
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      if (!isSupabaseConfigured) return;
      try {
        await hydrateSessionFromUrl();
        const session = getStoredSession();
        if (!session) {
          if (active) {
            setUser(null);
            setAuthReady(true);
          }
          return;
        }

        const appUser = await getOrCreateUserFromSession(session);
        if (active) {
          setUser(appUser);
          saveUser(appUser);
          setAuthReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (active) setAuthReady(true);
      }
    };
    initAuth();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setLogs([]);
      setLastEntry(null);
      return;
    }

    const loadLogs = async () => {
      if (isSupabaseConfigured) {
        const token = getAccessToken();
        if (token) {
          try {
            const remoteLogs = await fetchLogsFromSupabase(user.id, token);
            if (active) {
              setLogs(remoteLogs);
              saveLogs(remoteLogs, user.id);
            }
            return;
          } catch (error) {
            console.error('Failed to fetch logs from Supabase. Fallback to local cache.', error);
          }
        }
      }

      const storedLogs = getLogs(user.id);
      if (active) {
        if (storedLogs.length === 0) {
          setLogs([]);
          saveLogs([], user.id);
        } else {
          setLogs(storedLogs);
        }
      }
    };
    loadLogs();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (user && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    saveUser(userData);
    setAuthReady(true);
    navigate('/');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await signOutSupabase();
      } catch (error) {
        console.error('Failed to sign out from Supabase:', error);
      }
    }
    setUser(null);
    saveUser(null);
    setLogs([]);
    setLastEntry(null);
    navigate('/login');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    if (isSupabaseConfigured) {
      const token = getAccessToken();
      if (!token) {
        alert('認証セッションが切れています。再ログインしてください。');
        return;
      }
      try {
        await upsertProfile(updatedUser, token);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'プロフィール更新に失敗しました。';
        alert(message);
        return;
      }
    }
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const handleRecord = async (entry: LogEntry) => {
    if (!user) return;
    const entryWithUser = { ...entry, userId: user.id };

    if (isSupabaseConfigured) {
      const token = getAccessToken();
      if (!token) {
        alert('認証セッションが切れています。再ログインしてください。');
        return;
      }
      try {
        await createLogInSupabase(entryWithUser, user.id, token);
      } catch (error) {
        const message = error instanceof Error ? error.message : '学習ログの保存に失敗しました。';
        alert(message);
        return;
      }
    }

    const updatedLogs = [entryWithUser, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs, user.id);
    setLastEntry(entryWithUser);
    navigate('/success');
  };

  const handleUpdateLog = async (logId: string, patch: Partial<LogEntry>) => {
    if (!user) return;

    if (isSupabaseConfigured) {
      const token = getAccessToken();
      if (!token) {
        alert('認証セッションが切れています。再ログインしてください。');
        return;
      }
      try {
        await updateLogInSupabase(logId, user.id, patch, token);
      } catch (error) {
        const message = error instanceof Error ? error.message : '学習ログの更新に失敗しました。';
        alert(message);
        return;
      }
    }

    const updatedLogs = logs.map(l => l.id === logId ? { ...l, ...patch, id: l.id, userId: user.id } : l);
    setLogs(updatedLogs);
    saveLogs(updatedLogs, user.id);
    setLastEntry(prev => (prev && prev.id === logId) ? { ...prev, ...patch, id: prev.id, userId: user.id } : prev);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!user) return;

    if (isSupabaseConfigured) {
      const token = getAccessToken();
      if (!token) {
        alert('認証セッションが切れています。再ログインしてください。');
        return;
      }
      try {
        await deleteLogInSupabase(logId, user.id, token);
      } catch (error) {
        const message = error instanceof Error ? error.message : '学習ログの削除に失敗しました。';
        alert(message);
        return;
      }
    }

    const updatedLogs = logs.filter(l => l.id !== logId);
    setLogs(updatedLogs);
    saveLogs(updatedLogs, user.id);
    setLastEntry(prev => (prev && prev.id === logId) ? null : prev);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-300">
        認証情報を確認しています...
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const isFullscreenView = ['/login', '/success'].includes(location.pathname);

  return (
    <div
      key={user ? 'auth-mode' : 'guest-mode'}
      className={`relative z-0 isolate min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-background-dark text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden flex flex-col md:flex-row`}
    >
      {/* Universal Space Background */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbw0Y_C9rFRbtY0st_18IbMUEaKuoHI6WDDAPkPmcXNZ030qzttwOIMo4Yk7CNSfw0CCoQD17dUrPiYhLyPCRTSkY8ctBTOtjWF1Zd2--dxF-rB_eJ9PgfKOA7ilVj56V43esk2w6DMBl7Pmwslt8HlsrpHW0Nc6I5EZLg_pe4oOW4hk8zsUZHJlKx_bE5qqFuj5WGocypesIBaO4VJP4et9JuUS5IQO_rbmqORoXXcAqCQXMQwCGtGYxgERK5zHlRhW5O5YCFXKTK"
          alt="Space"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none select-none ${theme === 'dark' ? 'opacity-30' : 'opacity-10'} mix-blend-multiply md:mix-blend-lighten`}
        />
        <div
          className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-b from-blue-900/10 via-background-dark/80 to-background-dark' : 'bg-gradient-to-b from-blue-100/50 via-slate-50/80 to-slate-50'}`}
        ></div>
      </div>

      {/* Global Theme Toggle Button */}
      {!isFullscreenView && (
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-[100] w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-primary"
        >
          <span className="material-symbols-outlined filled">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      )}

      {!isFullscreenView && <Navigation theme={theme} />}

      <main className={`relative z-10 w-full flex-1 flex flex-col items-center overflow-y-auto ${!isFullscreenView ? 'pb-24 md:pb-0 md:pl-24' : ''}`}>
        <div className="w-full max-w-4xl min-h-screen flex flex-col">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/" element={<RecordPage onRecord={handleRecord} theme={theme} />} />
            <Route path="/history" element={<HistoryPage logs={logs} theme={theme} onUpdateLog={handleUpdateLog} onDeleteLog={handleDeleteLog} />} />
            <Route path="/analysis" element={<AnalysisPage logs={logs} user={user} theme={theme} />} />
            <Route path="/settings" element={<SettingsPage user={user} onLogout={handleLogout} theme={theme} onThemeChange={(t) => setTheme(t)} onUpdateUser={handleUpdateUser} />} />
            <Route path="/success" element={<SuccessPage entry={lastEntry} user={user} theme={theme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
