
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeType } from '../types';

interface NavigationProps {
  theme?: ThemeType;
}

const Navigation: React.FC<NavigationProps> = ({ theme = 'dark' }) => {
  const navItems = [
    { path: '/', label: '記録', icon: 'edit_note' },
    { path: '/history', label: '履歴', icon: 'history' },
    { path: '/analysis', label: '分析', icon: 'monitoring' },
    { path: '/settings', label: '設定', icon: 'settings' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 w-full z-50 md:top-0 md:left-0 md:w-24 md:h-full md:flex-col md:border-r border-t border-white/10 dark:border-white/10 border-slate-200 backdrop-blur-xl transition-colors duration-500 ${theme === 'dark' ? 'bg-background-dark/80' : 'bg-white/80'}`}>
      <div className="hidden md:flex items-center justify-center h-24 mb-4">
        <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_10px_rgba(245,197,24,0.5)] filled">
          rocket_launch
        </span>
      </div>
      
      <div className="relative h-20 px-2 flex justify-around items-center pb-2 md:flex-col md:h-auto md:space-y-8 md:pb-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 md:w-full group transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-gray-300'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative mb-1 p-1 flex items-center justify-center">
                  {isActive && <div className="absolute inset-0 bg-primary/30 blur-md rounded-full"></div>}
                  <span className={`material-symbols-outlined text-2xl relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'filled' : ''}`}>
                    {item.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-bold tracking-tight md:mt-1`}>{item.label}</span>
                {isActive && (
                  <div className="hidden md:block absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(245,197,24,0.8)]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
