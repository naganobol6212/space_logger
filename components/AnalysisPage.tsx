
import React, { useMemo } from 'react';
import { LogEntry, User, ThemeType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface AnalysisPageProps {
  logs: LogEntry[];
  user: User | null;
  theme?: ThemeType;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ logs, user, theme }) => {
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      const cat = log.category || 'Other';
      const hours = parseFloat(log.duration.replace(/[^0-9.]/g, '')) || 1;
      const normalizedHours = log.duration.includes('分') ? hours / 60 : hours;
      stats[cat] = (stats[cat] || 0) + normalizedHours;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const weeklyData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 1.2 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.0 },
  ];

  const COLORS = ['#00f3ff', '#F5C518', '#bc13fe', '#ff4d4d'];
  const totalHours = categoryStats.reduce((sum, item) => sum + item.value, 0);
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-24 md:pt-8">
      <header className="pt-14 px-6 pb-6 flex justify-between items-end md:pt-6">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-200 drop-shadow-sm md:text-4xl">
            ミッション分析
          </h1>
          <p className="text-xs text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-wider uppercase">MISSION ANALYTICS</p>
        </div>
      </header>

      <main className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl h-[400px] flex flex-col ring-1 ring-slate-200 dark:ring-white/5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-blue-200 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">analytics</span>
            週間の学習推移
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff10" : "#00000010"} vertical={false} />
                <XAxis dataKey="day" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, 
                    borderRadius: '12px',
                    color: isDark ? '#fff' : '#000'
                  }}
                  itemStyle={{ color: '#F5C518' }}
                />
                <Bar dataKey="hours" fill="#F5C518" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl h-[400px] flex flex-col ring-1 ring-slate-200 dark:ring-white/5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">pie_chart</span>
            スキル配分
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: isDark ? '#94a3b8' : '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase">Total</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '総学習回数', val: logs.length, unit: '回', icon: 'auto_awesome', color: 'text-cyan-500' },
            { label: '平均時間', val: (totalHours / (logs.length || 1)).toFixed(1), unit: 'h/回', icon: 'timer', color: 'text-amber-500' },
            { label: '今週の伸び', val: '+12', unit: '%', icon: 'trending_up', color: 'text-green-500' },
            { label: '完了率', val: '94', unit: '%', icon: 'task_alt', color: 'text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <span className={`material-symbols-outlined mb-2 ${stat.color}`}>{stat.icon}</span>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {stat.val}<span className="text-[10px] ml-0.5 text-slate-400 dark:text-gray-400">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnalysisPage;
