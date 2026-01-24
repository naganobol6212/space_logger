
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogEntry, User, ThemeType } from '../types';
import { syncLogToGitHub } from '../store';

interface SuccessPageProps {
  entry: LogEntry | null;
  user: User | null;
  // Added theme prop to match usage in App.tsx
  theme?: ThemeType;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ entry, user, theme }) => {
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = React.useState('');

  const handleSync = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    const result = await syncLogToGitHub(user);
    if (result.success) {
      setSyncStatus('success');
      setSyncMessage('Mission Log Updated! (GitHubに草が生えました)');
    } else {
      setSyncStatus('error');
      setSyncMessage(result.message || 'Sync failed');
    }
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-between p-6">
      <div className="flex-1"></div>

      <div className="w-full bg-glass-gradient backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl animate-float ring-1 ring-white/5 relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full scale-150"></div>
          <span className="material-symbols-outlined text-6xl text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filled">
            rocket_launch
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[0.2em] text-center text-white mb-2 drop-shadow-md">
          MISSION<br />COMPLETE
        </h1>
        <p className="text-white/80 text-sm text-center mb-8 font-light tracking-wide">
          学習を記録しました！
        </p>

        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1 p-4 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Subject</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#61DAFB] shadow-[0_0_8px_#61DAFB]"></span>
              <span className="text-lg font-bold truncate">{entry?.title.split(' ')[0] || 'Learning'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Time</span>
            <span className="text-lg font-bold">{entry?.duration || '1h'}</span>
          </div>
        </div>

        <div className="w-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-3 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-orange-400 filled animate-pulse">local_fire_department</span>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] text-orange-200 uppercase tracking-widest font-bold">Current Streak</span>
            <span className="text-xl font-bold text-white">{user?.streak || 14} Days</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[40px] flex flex-col items-center justify-center w-full gap-4">
        {syncStatus === 'success' && (
          <div className="w-full bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-center animate-fade-in-up">
            <p className="text-green-300 font-bold text-sm">{syncMessage}</p>
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="w-full bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-center animate-fade-in-up">
            <p className="text-red-300 font-bold text-sm">{syncMessage}</p>
          </div>
        )}

        {user?.githubToken && (
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing' || syncStatus === 'success'}
            className={`w-full ${syncStatus === 'success' ? 'bg-green-600' : 'bg-slate-800'} text-white font-bold text-lg py-4 rounded-xl border border-white/10 hover:bg-slate-700 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2`}
          >
            {syncStatus === 'syncing' ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : syncStatus === 'success' ? (
              <span className="material-symbols-outlined">check</span>
            ) : (
              <span className="material-symbols-outlined">public</span>
            )}
            <span>{syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? 'Synced' : 'Sync to Earth'}</span>
          </button>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-primary text-[#0b0b0e] font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(242,194,79,0.4)] hover:shadow-[0_0_30px_rgba(242,194,79,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <span>ダッシュボードに戻る</span>
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>

      <div className="h-4"></div>
    </div>
  );
};

export default SuccessPage;
