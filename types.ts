
export type TabType = 'record' | 'history' | 'analysis' | 'settings' | 'success';
export type ThemeType = 'dark' | 'light';

export interface LogEntry {
  id: string;
  title: string;
  duration: string;
  tags: string[];
  memo: string;
  timestamp: string; // ISO format
  category: 'Frontend' | 'Backend' | 'Infrastructure' | 'Design';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  theme?: ThemeType;
}
