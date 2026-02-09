
import React, { useState, useEffect } from 'react';
import { User, ThemeType } from '../types';
import { getGitHubAuthStatus, isSupabaseConfigured, startGitHubOAuth } from '../supabase';

interface SettingsPageProps {
  user: User | null;
  onLogout: () => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onUpdateUser: (user: User) => void;
}

type SettingsView = 'menu' | 'profile' | 'theme' | 'github';

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout, theme, onThemeChange, onUpdateUser }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('menu');
  const [userName, setUserName] = useState(user?.name || '');
  const [userAvatar, setUserAvatar] = useState(user?.avatar || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
  const [githubAuth, setGithubAuth] = useState<{ isGithubOAuth: boolean; oauthUsername: string | null; ready: boolean }>({
    isGithubOAuth: false,
    oauthUsername: null,
    ready: false,
  });

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserAvatar(user.avatar);
      setGithubUsername(user.githubUsername || '');
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const loadGitHubAuth = async () => {
      const status = await getGitHubAuthStatus();
      if (!mounted) return;
      setGithubAuth({
        isGithubOAuth: status.isGithubOAuth,
        oauthUsername: status.oauthUsername,
        ready: true,
      });
      setGithubUsername(prev => prev || status.oauthUsername || '');
    };
    loadGitHubAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveProfile = () => {
    if (!user) return;
    setSaveStatus('saving');

    const updatedUser = {
      ...user,
      name: userName,
      avatar: userAvatar
    };

    setTimeout(() => {
      onUpdateUser(updatedUser);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleConnectGitHub = async () => {
    if (!isSupabaseConfigured) return;
    await startGitHubOAuth();
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setUserAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-slate-200 dark:bg-white/5 shadow-xl">
                  <img src={userAvatar} className="w-full h-full object-cover" alt="User Avatar" />
                </div>
                <button
                  onClick={generateRandomAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">cached</span>
                </button>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-300 font-bold uppercase tracking-widest">アバターをランダム生成</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase ml-1">コマンダーネーム</label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="名前を入力してください"
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 mt-1 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-800 dark:text-white"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saveStatus !== 'idle'}
                className={`w-full ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-primary'} text-black font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}
              >
                {saveStatus === 'saving' ? (
                  <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                ) : saveStatus === 'saved' ? (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                ) : null}
                {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '保存完了' : '変更を保存'}
              </button>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
            {[
              { id: 'dark', name: 'Deep Space', desc: '没入感のあるダークテーマ', color: 'bg-background-dark' },
              { id: 'light', name: 'Solar Energy', desc: '高視認性のライトテーマ', color: 'bg-white' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id as ThemeType)}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group ${theme === t.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl ${t.color} border border-slate-300 dark:border-white/20 shadow-inner`}></div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${theme === t.id ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>{t.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500">{t.desc}</p>
                </div>
                {theme === t.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
              </button>
            ))}
          </div>
        );

      case 'github':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="w-full flex flex-col items-center justify-center mb-4">
              <div className="w-20 h-20 bg-slate-200 dark:bg-white/10 rounded-3xl flex items-center justify-center mb-4 border border-slate-300 dark:border-white/10">
                <span className="material-symbols-outlined text-4xl text-slate-800 dark:text-white">hub</span>
              </div>
              <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-white">GitHub Connect</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">学習ログを自動で同期します</p>
            </div>

            {!githubAuth.isGithubOAuth && (
              <button
                onClick={handleConnectGitHub}
                className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">hub</span>
                GitHubと連携する
              </button>
            )}

            {githubAuth.isGithubOAuth && (
              <div className="w-full bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <p className="text-xs font-bold text-green-600 dark:text-green-300">
                  GitHub連携済み {githubAuth.oauthUsername ? `(@${githubAuth.oauthUsername})` : ''}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase ml-1">GitHub Username</label>
                <input
                  value={githubAuth.oauthUsername || githubUsername || ''}
                  readOnly
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 mt-1 text-slate-500 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase ml-1">Repository</label>
                <input
                  value="space-logger"
                  disabled
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 mt-1 text-slate-500 dark:text-gray-300"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                GitHub OAuthでログイン済みなら、学習記録後にそのまま同期できます。
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {[
              { id: 'profile', label: 'プロフィール編集', sub: '名前・アバター設定', icon: 'person', color: 'text-blue-500' },
              { id: 'theme', label: 'テーマ設定', sub: '外観のカスタマイズ', icon: theme === 'dark' ? 'dark_mode' : 'light_mode', color: 'text-amber-500' },
              { id: 'github', label: 'GitHub連携', sub: 'コミットの同期', icon: 'hub', color: 'text-slate-400' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as SettingsView)}
                className="w-full flex items-center justify-between p-5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-white/5 shadow-sm ${item.color} group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 dark:text-gray-200 text-sm">{item.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500">{item.sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
              </button>
            ))}

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-5 border border-red-500/20 dark:border-red-900/30 text-red-500 dark:text-red-400 rounded-3xl hover:bg-red-500/10 transition-colors mt-8 font-black"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              ログアウト
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-24 md:pt-8">
      <header className="pt-14 px-6 pb-8 flex items-end justify-between md:pt-6">
        <div className="flex items-center gap-4">
          {currentView !== 'menu' && (
            <button
              onClick={() => setCurrentView('menu')}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 transition-colors text-slate-800 dark:text-white"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-blue-200 drop-shadow-sm">
              {currentView === 'menu' ? '設定' :
                currentView === 'profile' ? 'プロフィール' :
                  currentView === 'theme' ? 'テーマ' : 'GitHub'}
            </h1>
            <p className="text-[10px] text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-widest uppercase">CONFIGURATION</p>
          </div>
        </div>
        {currentView === 'menu' && (
          <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5 shadow-lg shadow-primary/20 overflow-hidden bg-slate-200 dark:bg-white/5">
            <img src={user?.avatar} className="w-full h-full object-cover rounded-full" />
          </div>
        )}
      </header>

      <main className="px-4 max-w-2xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default SettingsPage;
