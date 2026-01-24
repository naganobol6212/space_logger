
import React, { useState } from 'react';
import { LogEntry, ThemeType } from '../types';

interface RecordPageProps {
  onRecord: (entry: LogEntry) => void;
  theme?: ThemeType;
}

const RecordPage: React.FC<RecordPageProps> = ({ onRecord, theme }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1時間');
  const [memo, setMemo] = useState('');
  const [tags, setTags] = useState<string[]>(['React']);
  const [availableTags, setAvailableTags] = useState([
    { id: 'react', label: 'React', icon: 'code_blocks' },
    { id: 'aws', label: 'AWS', icon: 'cloud' },
    { id: 'python', label: 'Python', icon: 'terminal' },
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const handleRecordSubmit = () => {
    if (!title.trim()) return;

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      title,
      duration,
      memo,
      tags,
      timestamp: new Date().toISOString(),
      category: 'Frontend',
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
    if (!availableTags.find(t => t.label === tagLabel)) {
      const newTag = { id: tagLabel.toLowerCase(), label: tagLabel, icon: 'label' };
      setAvailableTags([...availableTags, newTag]);
    }
    
    if (!tags.includes(tagLabel)) {
      setTags([...tags, tagLabel]);
    }
    
    setNewTagInput('');
    setShowAddTag(false);
  };

  const durations = ['30分', '1時間', '2時間', '3時間', '4時間+'];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up md:pt-8">
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
                <div className="relative">
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
                  学習時間
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {durations.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`relative overflow-hidden group rounded-xl py-3 flex flex-col items-center justify-center transition-all duration-300 border ${
                        duration === d 
                        ? 'bg-primary/20 border-primary text-primary shadow-sm' 
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-primary/50 text-slate-600 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-bold text-xs z-10">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-3 ml-1">
                  技術タグ
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.label)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
                        tags.includes(tag.label)
                        ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                      <span className="font-bold text-xs">{tag.label}</span>
                    </button>
                  ))}
                  
                  {showAddTag ? (
                    <form onSubmit={handleAddCustomTag} className="flex items-center bg-white dark:bg-white/10 rounded-full pl-3 pr-1 py-1 border border-primary">
                      <input 
                        autoFocus
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onBlur={handleAddCustomTag}
                        placeholder="タグ名..."
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white w-20"
                      />
                      <button type="submit" className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setShowAddTag(true)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full border border-dashed border-slate-300 dark:border-white/20 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span className="font-bold text-xs">タグ追加</span>
                    </button>
                  )}
                </div>
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
