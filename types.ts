
export type TabType = 'record' | 'history' | 'analysis' | 'settings' | 'success';
export type ThemeType = 'dark' | 'light';

export type LearningType = 'input' | 'output' | 'both';

export interface LogEntry {
  id: string;
  /** どのユーザーのログかを明示（後方互換のため任意とする） */
  userId?: string;
  title: string;
  duration: string; // 表示用 (例: "1時間30分")
  durationMinutes: number; // 計算用 (例: 90)
  learningType?: LearningType; // New field
  tags: string[]; // Tag IDs
  memo: string;
  timestamp: string; // ISO format
  category: 'Frontend' | 'Backend' | 'Infrastructure' | 'Design'; // Deprecated but kept for compatibility
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  theme?: ThemeType;
  githubUsername?: string;
  githubRepo?: string;
  githubToken?: string;
}
