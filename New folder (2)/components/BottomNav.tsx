import React from 'react';
import type { View } from '../types';
import { FilmIcon, TvIcon, SparklesIcon, BookmarkIcon } from './icons';
import { useFocusable } from '../hooks/useFocus';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
  view: View, 
  label: string, 
  icon: React.ReactNode, 
  isActive: boolean, 
  onClick: () => void 
}> = ({ view, label, icon, isActive, onClick }) => {
    const { focusableProps } = useFocusable({ id: `nav-${view}`, isCircle: true });

    return (
        <button
            {...focusableProps}
            onClick={() => {
                focusableProps.onClick();
                onClick();
            }}
            className={`${focusableProps.className} flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 w-24 h-16 ${
              isActive ? 'bg-cyan-500/50 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={label}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'movies', label: 'Movies', icon: <FilmIcon /> },
    { view: 'tv', label: 'TV Shows', icon: <TvIcon /> },
    { view: 'anime', label: 'Anime', icon: <SparklesIcon /> },
    { view: 'library', label: 'My List', icon: <BookmarkIcon /> },
  ];

  return (
    <nav className="w-full max-w-lg mx-auto">
      <div className="flex justify-around items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-2 shadow-lg">
        {navItems.map((item) => (
          <NavButton
            key={item.view}
            view={item.view}
            label={item.label}
            icon={item.icon}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
          />
        ))}
      </div>
    </nav>
  );
};