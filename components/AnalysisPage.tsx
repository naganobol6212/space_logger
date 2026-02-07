import React, { useMemo, useState } from 'react';
import { LogEntry, User, ThemeType } from '../types';

interface AnalysisPageProps {
  logs: LogEntry[];
  user: User | null;
  theme?: ThemeType;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ logs, user, theme }) => {
  // Debug switch: true にすると棒の高さを 50% 固定にして CSS/レイアウト問題を切り分けできる
  const DEBUG_FORCE_BAR_HEIGHT_50 = false;

  // Base date for navigation (defaults to today)
  const [baseDate, setBaseDate] = useState(new Date());

  // Helper: Get Monday of the week for a given date
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Normalize time
    return monday;
  };

  const currentWeekMonday = useMemo(() => {
    const d = new Date(baseDate);
    return getMonday(d);
  }, [baseDate]);

  // Navigation Handlers
  const goPrevWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() - 7);
    setBaseDate(newDate);
  };

  const goNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + 7);

    // Prevent going into future weeks (optional, but requested "don't go past today's week")
    const today = new Date();
    const nextWeekMonday = getMonday(new Date(newDate));
    const thisWeekMonday = getMonday(new Date(today));

    if (nextWeekMonday.getTime() <= thisWeekMonday.getTime()) {
      setBaseDate(newDate);
    }
  };

  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const thisMonday = getMonday(today);
    const viewMonday = getMonday(new Date(baseDate));
    return viewMonday.getTime() === thisMonday.getTime();
  }, [baseDate]);


  // 1. Weekly Stats (Based on currentWeekMonday)
  const weeklyStats = useMemo(() => {
    const stats = [];
    // We already calculated the Monday of the selected week
    const monday = new Date(currentWeekMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayName = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];

      // durationMinutes（分）を唯一のソース・オブ・トゥルースとして集計する
      const totalMinutes = logs.reduce((acc, log) => {
        const logDate = new Date(log.timestamp);
        const logDateStr = `${logDate.getFullYear()}-${(logDate.getMonth() + 1).toString().padStart(2, '0')}-${logDate.getDate().toString().padStart(2, '0')}`;

        if (logDateStr === dateStr) {
          const mins = Number.isFinite(log.durationMinutes) ? log.durationMinutes : 0;
          return acc + mins;
        }
        return acc;
      }, 0);

      stats.push({
        date: dateStr,
        label: `${shortDate}(${dayName})`,
        minutes: totalMinutes,
        hours: totalMinutes / 60,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }

    // デバッグ用: 日別minutesと元ログを確認したいときにコメントアウトを外す
    // console.log('[weeklyStats]', {
    //   baseWeek: currentWeekMonday.toISOString().slice(0, 10),
    //   stats,
    //   logsSnapshot: logs.map(l => ({
    //     id: l.id,
    //     durationMinutes: l.durationMinutes,
    //     duration: l.duration,
    //     timestamp: l.timestamp,
    //   })),
    // });

    return stats;
  }, [logs, currentWeekMonday]);

  // Weekly bar scale: max(day) * 1.2 (minutes)
  const weeklyMaxMinutes = useMemo(() => {
    const max = Math.max(0, ...weeklyStats.map(d => d.minutes));
    return max;
  }, [weeklyStats]);

  const weeklyScaleMaxMinutes = useMemo(() => {
    const baseMaxMinutes = 8 * 60; // 通常の基準: 8h
    if (weeklyMaxMinutes <= baseMaxMinutes) return baseMaxMinutes;

    // 8h超えの週だけ、2h刻みで上限を拡張する
    const twoHoursMinutes = 2 * 60;
    return Math.ceil(weeklyMaxMinutes / twoHoursMinutes) * twoHoursMinutes;
  }, [weeklyMaxMinutes]);

  // 2. Learning Style Stats (Localize Labels & Fix Logic)
  const learningStyleStats = useMemo(() => {
    let input = 0, output = 0, both = 0;

    logs.forEach(log => {
      const mins = Number.isFinite(log.durationMinutes) ? log.durationMinutes : 0;

      if (log.learningType === 'input') input += mins;
      else if (log.learningType === 'output') output += mins;
      else both += mins;
    });

    const total = input + output + both || 1;

    return {
      totalMinutes: total,
      input: { percent: (input / total) * 100, minutes: input },
      output: { percent: (output / total) * 100, minutes: output },
      both: { percent: (both / total) * 100, minutes: both }
    };
  }, [logs]);

  // Pie Chart Gradient
  const pieGradient = useMemo(() => {
    const { input, output, both } = learningStyleStats;

    let currentDeg = 0;
    const inputDeg = (input.percent / 100) * 360;
    const outputDeg = (output.percent / 100) * 360;

    // Calculate end angles
    const inputEnd = inputDeg;
    const outputEnd = inputDeg + outputDeg;

    return `conic-gradient(
          #10b981 0deg ${inputEnd}deg, 
          #f59e0b ${inputEnd}deg ${outputEnd}deg, 
          #a855f7 ${outputEnd}deg 360deg
      )`;
  }, [learningStyleStats]);


  const totalHours = weeklyStats.reduce((acc, cur) => acc + cur.minutes, 0) / 60;

  // Format Date Range for Display
  const dateRangeString = useMemo(() => {
    const start = weeklyStats[0];
    const end = weeklyStats[6];
    if (!start || !end) return '';
    // Parse YYYY-MM-DD to extract parts cleanly
    const [sY, sM, sD] = start.date.split('-');
    const [eY, eM, eD] = end.date.split('-');
    return `${sY}年 ${parseInt(sM)}月${parseInt(sD)}日 〜 ${parseInt(eM)}月${parseInt(eD)}日`;
  }, [weeklyStats]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-24 md:pt-8 min-h-screen">
      <header className="pt-14 px-6 pb-6 flex justify-between items-end md:pt-6">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-600 dark:from-white dark:to-blue-200 drop-shadow-sm md:text-4xl">
            ミッション分析
          </h1>
          <p className="text-xs text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-wider uppercase">MISSION ANALYTICS</p>
        </div>
      </header>

      <main className="px-4 grid grid-cols-1 gap-6">

        {/* Weekly Trend (Bar Chart: Mon-Sun) */}
        <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl ring-1 ring-slate-200 dark:ring-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-blue-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              週間学習推移
            </h3>

            {/* Week Navigation */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
              <button onClick={goPrevWeek} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-slate-500">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300 px-2 min-w-[140px] text-center">
                {dateRangeString}
              </span>
              <button
                onClick={goNextWeek}
                disabled={isCurrentWeek}
                className={`p-1 rounded-md transition-colors ${isCurrentWeek ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10 text-slate-500'}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex items-stretch justify-between h-40 gap-2">
            {weeklyStats.map((day) => {
              // Data-proportional scale: max(day) * 1.2
              // min height ensures visibility for non-zero days
              const minVisiblePercent = 3;
              const heightPercentRaw = weeklyScaleMaxMinutes > 0
                ? (day.minutes / weeklyScaleMaxMinutes) * 100
                : 0;
              const heightPercent = day.minutes > 0
                ? Math.min(Math.max(heightPercentRaw, minVisiblePercent), 100)
                : 0;
              const finalHeightPercent = DEBUG_FORCE_BAR_HEIGHT_50 ? 50 : heightPercent;

              if (import.meta.env.DEV) {
                console.log('[WeeklyBarDebug]', {
                  date: day.date,
                  dayMinutes: day.minutes,
                  weeklyMaxMinutes,
                  weeklyScaleMaxMinutes,
                  heightPercent,
                  finalHeightPercent,
                });
              }

              return (
                <div key={day.date} className="flex-1 h-full flex flex-col items-center group relative">
                  <div className="w-full relative flex-1 flex items-end bg-slate-100 dark:bg-white/5 rounded-t-lg overflow-hidden">
                    <div
                      style={{ height: `${finalHeightPercent}%` }}
                      className={`w-full relative transition-all duration-700 ease-out ${day.isToday ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-gradient-to-t from-blue-400/70 to-blue-300/70 dark:from-blue-500/50 dark:to-blue-400/50'}`}
                    >
                      {/* Glass shine effect */}
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                    {/* Absolute value for precision if > 0 */}
                    {day.hours > 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white drop-shadow-md z-10">
                        {day.hours.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {day.label} : {day.hours.toFixed(1)}h
                  </div>

                  <span className={`text-[9px] font-bold mt-2 whitespace-nowrap ${day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Style (Pie Chart) */}
          <div className="glass-panel bg-white/80 dark:bg-glass-dark border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col items-center justify-center relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-blue-200 mb-6 absolute top-6 left-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">pie_chart</span>
              学習スタイル比率
            </h3>

            <div className="relative w-48 h-48 mt-8">
              {/* CSS Pie Chart */}
              <div
                className="w-full h-full rounded-full shadow-inner"
                style={{ background: pieGradient }}
              ></div>
              {/* Inner Circle (Donut) */}
              <div className="absolute inset-4 bg-white dark:bg-[#0f172a] rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {(learningStyleStats.totalMinutes / 60).toFixed(1)}
                  <span className="text-xs ml-1 font-bold text-slate-400">h</span>
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">インプット</span>
                  <span className="text-xs font-black text-slate-700 dark:text-white">{Math.round(learningStyleStats.input.percent)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">アウトプット</span>
                  <span className="text-xs font-black text-slate-700 dark:text-white">{Math.round(learningStyleStats.output.percent)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">両方</span>
                  <span className="text-xs font-black text-slate-700 dark:text-white">{Math.round(learningStyleStats.both.percent)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined mb-2 text-cyan-500">auto_awesome</span>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold">総学習回数</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{logs.length}</p>
            </div>
            <div className="glass-panel bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined mb-2 text-amber-500">timer</span>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold">週間平均 ({dateRangeString ? '7d' : '-'})</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {((weeklyStats.reduce((acc, d) => acc + d.minutes, 0) / 7) / 60).toFixed(1)}<span className="text-xs ml-1 font-bold text-slate-400">h</span>
              </p>
            </div>
            <div className="glass-panel bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm col-span-2">
              <span className="material-symbols-outlined mb-2 text-emerald-500">calendar_month</span>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold">この週の合計学習時間</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {totalHours.toFixed(1)}<span className="text-sm ml-1 font-bold text-slate-400">hours</span>
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalysisPage;
