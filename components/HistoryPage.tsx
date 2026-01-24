
import React, { useState } from 'react';
import { LogEntry, ThemeType } from '../types';

interface HistoryPageProps {
  logs: LogEntry[];
  theme?: ThemeType;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ logs, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <header className="pt-14 px-6 pb-4 flex justify-between items-center md:pt-6">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-200 drop-shadow-sm">
            学習履歴
          </h1>
          <p className="text-xs text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-wider uppercase">LEARNING ARCHIVE</p>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 backdrop-blur text-slate-500 dark:text-white/70 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
          <span className="material-symbols-outlined text-lg">filter_list</span>
        </button>
      </header>

      <div className="px-4 pb-24 flex-1 flex flex-col overflow-hidden">
        <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-xl ring-1 ring-slate-200 dark:ring-white/5 h-full flex flex-col">
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/50 material-symbols-outlined">search</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl py-3 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner text-sm"
              placeholder="トピックや技術を検索..."
              type="text"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-hide">
            {filteredLogs.map((log, idx) => (
              <div key={log.id} className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-primary/20 to-transparent">
                <div className="relative flex items-center bg-white dark:bg-[#131d33] p-4 rounded-2xl overflow-hidden hover:bg-slate-50 dark:hover:bg-[#1a2642] transition-colors shadow-sm border border-slate-100 dark:border-transparent">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                      {log.tags.includes('AWS') ? 'cloud' : log.tags.includes('Python') ? 'terminal' : 'code_blocks'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate pr-2">{log.title}</h3>
                      <span className="text-xs font-black text-primary whitespace-nowrap">{log.duration}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-gray-400 space-x-2">
                      <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-white/5 uppercase">
                        {log.tags[0] || 'Learning'}
                      </span>
                      <span>•</span>
                      <span className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-2xl shadow-lg"></div>
                  )}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <span className="material-symbols-outlined text-4xl block mb-2 text-slate-400">search_off</span>
                <p className="text-sm text-slate-500">該当する記録が見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
