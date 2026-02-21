
import React, { useState, useEffect } from 'react';
import { LogEntry, ThemeType, LearningType } from '../types';
import { TAGS, getTagById } from '../constants/tags';
import { addCustomTag, getCustomTags, removeCustomTag } from '../store';

interface RecordPageProps {
  onRecord: (entry: LogEntry) => void;
  theme?: ThemeType;
}

const RecordPage: React.FC<RecordPageProps> = ({ onRecord, theme }) => {
  const [title, setTitle] = useState('');
  const [learningType, setLearningType] = useState<LearningType>('both');
  const [duration, setDuration] = useState('1時間');
  const [durationMode, setDurationMode] = useState<'time' | 'pomodoro' | 'custom'>('time');
  const [memo, setMemo] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(['react']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  // Custom Tags State
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    setCustomTags(getCustomTags());
  }, []);

  // Helper to calculate minutes from duration string
  const calculateMinutes = (dur: string): number => {
    // ポモドーロ形式 ("2ポモドーロ (50分)" など)
    if (dur.includes('ポモドーロ')) {
      const match = dur.match(/(\d+)ポモドーロ/);
      return match && match[1] ? parseInt(match[1], 10) * 25 : 0;
    }

    // "1時間30分" / "90分" / "1.5時間"
    let totalMinutes = 0;
    const hourMatch = dur.match(/(\d+(?:\.\d+)?)時間/);
    if (hourMatch && hourMatch[1]) totalMinutes += parseFloat(hourMatch[1]) * 60;

    const minuteMatch = dur.match(/(\d+(?:\.\d+)?)分/);
    if (minuteMatch && minuteMatch[1]) totalMinutes += parseFloat(minuteMatch[1]);

    // Fallback: number only
    if (totalMinutes === 0 && !dur.includes('時間') && !dur.includes('分')) {
      const val = parseFloat(dur.replace(/[^0-9.]/g, ''));
      return isNaN(val) ? 0 : val * 60; // Assume hours if plain number (e.g. "1.5" -> 90)
    }

    return totalMinutes;
  };

  const handleRecordSubmit = () => {
    if (!title.trim()) return;

    const minutes = calculateMinutes(duration);
    if (minutes > 1440) {
      alert('24時間を超える学習時間は記録できません。');
      return;
    }

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      title,
      duration,
      durationMinutes: minutes,
      learningType,
      tags: selectedTagIds,
      memo,
      timestamp: new Date().toISOString(),
      category: 'Frontend', // Deprecated
    };

    onRecord(newEntry);
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTagInput.trim()) {
      setShowAddTag(false);
      return;
    }

    const tagLabel = newTagInput.trim();
    // Use label as ID for custom tags, lowercase for consistency
    const customId = tagLabel;

    // Save to store
    addCustomTag(tagLabel);
    setCustomTags(prev => [...new Set([...prev, tagLabel])]);

    // Select it
    if (!selectedTagIds.includes(customId)) {
      setSelectedTagIds([...selectedTagIds, customId]);
    }

    setNewTagInput('');
    setShowAddTag(false);
  };

  const handleDeleteCustomTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCustomTag(tag);
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value;
    if (tagId && !selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    // Reset select to default
    e.target.value = '';
  };

  // Merge predefined tags and custom tags
  const allAvailableTags = [
    ...TAGS,
    ...customTags.map(tag => ({ id: tag, label: tag, icon: 'label', color: 'text-slate-500', isCustom: true }))
  ];

  // Filter out already selected tags from the dropdown options
  const availableOptions = allAvailableTags.filter(t => !selectedTagIds.includes(t.id));

  return (
    <div className="flex flex-col h-full animate-fade-in-up md:pt-8 relative z-20">
      <header className="pt-14 px-6 pb-6 flex justify-between items-center md:pt-6">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-200 drop-shadow-sm md:text-4xl">
            学習を記録
          </h1>
          <p className="text-xs text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-wider uppercase">NEW MISSION ENTRY</p>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 backdrop-blur text-slate-500 dark:text-white/70 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </header>

      <div className="px-4 pb-24 md:pb-12">
        <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl ring-1 ring-slate-200 dark:ring-white/5 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-2 ml-1">
                  学習した内容 <span className="text-primary ml-1">*</span>
                </label>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/50 material-symbols-outlined">edit</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner"
                    placeholder="例: React Server Components"
                    type="text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-3 ml-1">
                  学習タイプ
                </label>
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6">
                  {[
                    { id: 'input', label: 'インプット', icon: 'menu_book' },
                    { id: 'output', label: 'アウトプット', icon: 'code' },
                    { id: 'both', label: 'インプット+アウトプット', icon: 'compare_arrows' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setLearningType(type.id as LearningType)}
                      className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 rounded-lg transition-all ${learningType === type.id
                        ? 'bg-white dark:bg-blue-600 text-primary dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">{type.icon}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-3 ml-1">
                  学習時間
                </label>

                {/* Duration Input Type Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-3">
                  {(['time', 'pomodoro', 'custom'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setDurationMode(type);
                        if (type === 'time') setDuration('1時間');
                        if (type === 'pomodoro') setDuration('1ポモドーロ (25分)');
                        if (type === 'custom') setDuration('');
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${durationMode === type
                        ? 'bg-white dark:bg-blue-600 text-primary dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                      {type === 'time' && '時間指定'}
                      {type === 'pomodoro' && 'ポモドーロ'}
                      {type === 'custom' && '自由入力'}
                    </button>
                  ))}
                </div>

                {/* Time Selection Mode */}
                {durationMode === 'time' && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/50 material-symbols-outlined">schedule</span>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl py-4 pl-12 pr-10 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner cursor-pointer"
                    >
                      {Array.from({ length: 30 }, (_, i) => { // 0.5h to 15h
                        const minutes = (i + 1) * 30;
                        const h = Math.floor(minutes / 60);
                        const m = minutes % 60;
                        let label = '';
                        if (h > 0) label += `${h}時間`;
                        if (m > 0) label += `${m}分`;
                        return (
                          <option key={minutes} value={label}>{label}</option>
                        );
                      })}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined">expand_more</span>
                  </div>
                )}

                {/* Pomodoro Mode */}
                {durationMode === 'pomodoro' && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/50 material-symbols-outlined">timer</span>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl py-4 pl-12 pr-10 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner cursor-pointer"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={`${num}ポモドーロ (${num * 25}分)`}>
                          {num} ポモドーロ ({num * 25}分)
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined">expand_more</span>
                  </div>
                )}

                {/* Custom Input Mode */}
                {durationMode === 'custom' && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/50 material-symbols-outlined">edit_note</span>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="例: 45分, 1.5時間"
                      className="w-full bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-3 ml-1">
                  技術タグ <span className="text-slate-400 font-normal ml-2">※複数選択可</span>
                </label>

                {/* 1. Selected Tags (Chips) */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTagIds.map(tagId => {
                    const tagDef = getTagById(tagId);
                    return (
                      <button
                        key={tagId}
                        onClick={() => toggleTag(tagId)}
                        className="group flex items-center space-x-2 px-3 py-2 rounded-lg border bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/30 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px] group-hover:hidden">{tagDef.icon || 'label'}</span>
                        <span className="material-symbols-outlined text-[16px] hidden group-hover:block">close</span>
                        <span className="font-bold text-xs">{tagDef.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Tag Selection Dropdown & Custom Add */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">tag</span>
                    <select
                      onChange={handleTagSelect}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-8 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>タグを選択して追加...</option>
                      {availableOptions.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                  </div>

                  {!showAddTag ? (
                    <button
                      onClick={() => setShowAddTag(true)}
                      className="px-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center"
                      title="カスタムタグを追加"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  ) : (
                    <form onSubmit={handleAddCustomTag} className="flex-1 flex gap-2">
                      <input
                        autoFocus
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onBlur={handleAddCustomTag}
                        placeholder="自由入力..."
                        className="w-full bg-white dark:bg-white/10 border border-primary rounded-xl px-3 text-sm outline-none"
                      />
                    </form>
                  )}
                </div>

                {/* Custom Tags Management */}
                {customTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">保存されたタグ</p>
                    <div className="flex flex-wrap gap-2">
                      {customTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-gray-400">
                          <span>{tag}</span>
                          <button
                            onClick={(e) => handleDeleteCustomTag(tag, e)}
                            className="hover:text-red-500 rounded-full p-0.5"
                          >
                            <span className="material-symbols-outlined text-[10px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col mb-8">
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-2 ml-1">
                  メモ
                </label>
                <div className="relative flex-1">
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full h-full min-h-[150px] bg-white dark:bg-[#0B1221]/60 border border-slate-200 dark:border-blue-800/30 rounded-2xl p-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-400/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all shadow-inner"
                    placeholder="気づきや次回の目標を入力..."
                  ></textarea>
                  <span className="absolute right-3 bottom-3 text-slate-300 dark:text-white/20 material-symbols-outlined text-sm">sticky_note_2</span>
                </div>
              </div>

              <button
                onClick={handleRecordSubmit}
                disabled={!title.trim()}
                className={`w-full relative group overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] ${!title.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-primary/30'}`}
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                  <span>ミッション完了</span>
                </span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
