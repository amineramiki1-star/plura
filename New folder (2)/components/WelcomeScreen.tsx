import React, { useState } from 'react';
import { useFocusable } from '../hooks/useFocus';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { isFocused, focusableProps } = useFocusable({ id: 'welcome-enter-button', isCircle: true });

  const handleEnterClick = () => {
    focusableProps.onClick();
    setIsExiting(true);
    setTimeout(onEnter, 500); // Match duration of fade-out animation
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white transition-opacity duration-500 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-96 h-96 md:w-[32rem] md:h-[32rem] bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-96 h-96 md:w-[32rem] md:h-[32rem] bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8 text-center animate-fade-in">
        
        {/* Logo (Unchanged) */}
        <div className="flex flex-col items-center">
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tighter leading-none">
              Plura
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mt-2 tracking-widest animate-fade-in" style={{ animationDelay: '0.5s'}}>
              Your Cinematic Universe Awaits.
            </p>
        </div>
        
        {/* New Entry Button */}
        <div className="mt-24">
            <button
              {...focusableProps}
              onClick={handleEnterClick}
              className={`${focusableProps.className} px-10 py-4 rounded-full text-xl font-semibold tracking-wider text-white bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg transition-all duration-300 ease-in-out hover:bg-white/20`}
              aria-label="Begin"
            >
              Begin
            </button>
        </div>
      </div>
    </div>
  );
};