
import React, { useState } from 'react';
import { LogEntry, ThemeType } from '../types';
import { getTagById } from '../constants/tags';

interface HistoryPageProps {
  logs: LogEntry[];
  theme?: ThemeType;
  onUpdateLog: (logId: string, patch: Partial<LogEntry>) => void;
  onDeleteLog: (logId: string) => void;
}

interface HistoryItemProps {
  log: LogEntry;
  idx: number;
  onUpdateLog: (logId: string, patch: Partial<LogEntry>) => void;
  onDeleteLog: (logId: string) => void;
}

const parseDurationToMinutes = (dur: string): number => {
  if (!dur) return 0;

  // ポモドーロ形式 ("2ポモドーロ (50分)" など)
  if (dur.includes('ポモドーロ')) {
    const match = dur.match(/(\d+)ポモドーロ/);
    return match && match[1] ? parseInt(match[1], 10) * 25 : 0;
  }

  let totalMinutes = 0;
  const hourMatch = dur.match(/(\d+(?:\.\d+)?)時間/);
  if (hourMatch && hourMatch[1]) totalMinutes += parseFloat(hourMatch[1]) * 60;

  const minuteMatch = dur.match(/(\d+(?:\.\d+)?)分/);
  if (minuteMatch && minuteMatch[1]) totalMinutes += parseFloat(minuteMatch[1]);

  if (totalMinutes === 0 && !dur.includes('時間') && !dur.includes('分')) {
    const val = parseFloat(dur.replace(/[^0-9.]/g, ''));
    return isNaN(val) ? 0 : val * 60;
  }

  return totalMinutes;
};

const toDateInputValue = (iso: string): string => {
  // yyyy-mm-dd (local)
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const fromDateInputValueToISO = (yyyyMmDd: string, fallbackISO: string): string => {
  // Keep time as 00:00 local; if invalid, fallback
  const [y, m, d] = yyyyMmDd.split('-').map(n => parseInt(n, 10));
  if (!y || !m || !d) return fallbackISO;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return dt.toISOString();
};

const HistoryItem: React.FC<HistoryItemProps> = ({ log, idx, onUpdateLog, onDeleteLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(log.title || '');
  const [editDuration, setEditDuration] = useState(log.duration || '');
  const [editLearningType, setEditLearningType] = useState<NonNullable<LogEntry['learningType']>>(log.learningType || 'both');
  const [editDate, setEditDate] = useState(log.timestamp ? toDateInputValue(log.timestamp) : toDateInputValue(new Date().toISOString()));

  const startEdit = () => {
    setIsEditing(true);
    setEditTitle(log.title || '');
    setEditDuration(log.duration || '');
    setEditLearningType(log.learningType || 'both');
    setEditDate(log.timestamp ? toDateInputValue(log.timestamp) : toDateInputValue(new Date().toISOString()));
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    const durationMinutes = parseDurationToMinutes(editDuration);
    const nextTimestamp = fromDateInputValueToISO(editDate, log.timestamp);
    onUpdateLog(log.id, {
      title: editTitle.trim() || 'No Title',
      duration: editDuration,
      durationMinutes,
      learningType: editLearningType,
      timestamp: nextTimestamp,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    const ok = window.confirm('この学習ログを削除しますか？（元に戻せません）');
    if (!ok) return;
    onDeleteLog(log.id);
  };

  // 安全にデータを取り出す
  const tags = Array.isArray(log.tags) ? log.tags : [];
  const firstTagId = tags[0] || 'unknown';
  const firstTagDef = getTagById(firstTagId);
  const iconName = firstTagDef?.icon ?? 'label'; // fallback icon

  const learningTypeConfig = {
    input: { label: 'インプット', icon: 'menu_book', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    output: { label: 'アウトプット', icon: 'code', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    both: { label: 'インプット＋アウトプット', icon: 'compare_arrows', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' }
  };

  // learningType が不正/undefinedの場合のフォールバック
  const safeType = (log.learningType && learningTypeConfig[log.learningType])
    ? log.learningType
    : 'both';
  const type = learningTypeConfig[safeType];

  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-primary/20 to-transparent">
      <div className="relative flex flex-col bg-white dark:bg-[#131d33] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-transparent transition-all">
        <div className="p-4 flex items-center">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mr-4">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
              {iconName}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {!isEditing ? (
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{log.title || 'No Title'}</h3>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${type.color}`}>
                    <span className="material-symbols-outlined text-[10px]">{type.icon}</span>
                    {type.label}
                  </span>
                </div>
                <span className="text-xs font-black text-primary whitespace-nowrap ml-2">{log.duration || '0m'}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1 ml-1">タイトル</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-2.5 px-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/20 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1 ml-1">学習時間</label>
                    <input
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      placeholder="例: 90分 / 1.5時間"
                      className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-2.5 px-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/20 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1 ml-1">学習タイプ</label>
                    <select
                      value={editLearningType}
                      onChange={(e) => setEditLearningType(e.target.value as NonNullable<LogEntry['learningType']>)}
                      className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-2.5 px-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    >
                      <option value="input">インプット</option>
                      <option value="output">アウトプット</option>
                      <option value="both">両方</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1 ml-1">日付</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-xl py-2.5 px-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-3 py-2 rounded-xl bg-primary text-black text-xs font-black hover:opacity-90 transition-opacity"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-500 dark:text-gray-400 space-x-2 overflow-hidden">
                <div className="flex flex-wrap gap-1">
                  {tags.map(tagId => {
                    const def = getTagById(tagId);
                    return (
                      <span key={tagId} className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-white/5 uppercase whitespace-nowrap">
                        {def?.label ?? tagId}
                      </span>
                    );
                  })}
                </div>
                <span className="flex-shrink-0">•</span>
                <span className="flex-shrink-0 font-medium">
                  {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'No Date'}
                </span>
              </div>

              <div className="ml-2 flex-shrink-0 flex items-center gap-1">
                {!isEditing && (
                  <>
                    <button
                      onClick={startEdit}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="編集"
                      aria-label="編集"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                      title="削除"
                      aria-label="削除"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </>
                )}

                {log.memo && !isEditing && (
                  <button
                    onClick={toggleExpand}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                    title="メモを開閉"
                    aria-label="メモを開閉"
                  >
                    <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details / Memo Section */}
        {isExpanded && log.memo && (
          <div className="px-4 pb-4 pt-0 animate-fade-in">
            <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-white/5">
              {log.memo}
            </div>
          </div>
        )}

        {idx === 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-2xl shadow-lg"></div>
        )}
      </div>
    </div>
  );
};

const HistoryPage: React.FC<HistoryPageProps> = ({ logs, theme, onUpdateLog, onDeleteLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 安全なフィルタリング
  const filteredLogs = (logs || []).filter(log => {
    if (!log) return false;
    const term = searchTerm.toLowerCase();
    const titleMatch = (log.title || '').toLowerCase().includes(term);

    const tags = Array.isArray(log.tags) ? log.tags : [];
    const tagMatch = tags.some(tagId => {
      const def = getTagById(tagId);
      return (def?.label ?? '').toLowerCase().includes(term);
    });

    return titleMatch || tagMatch;
  });

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
              <HistoryItem key={log.id} log={log} idx={idx} onUpdateLog={onUpdateLog} onDeleteLog={onDeleteLog} />
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
