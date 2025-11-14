import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { textToSpeech } from './geminiService';
import { playAudio, stopAudio } from './audioService';

interface AudioPlayerContextType {
  currentlyPlayingId: number | null;
  isLoading: boolean;
  play: (itemId: number, text: string) => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const requestRef = useRef(0);

    const handleAudioEnded = useCallback(() => {
        setCurrentlyPlayingId(null);
        setIsLoading(false);
    }, []);

    const play = useCallback(async (itemId: number, text: string) => {
        stopAudio();
        
        const requestId = ++requestRef.current;
        
        setIsLoading(true);
        setCurrentlyPlayingId(itemId);
        
        const audioData = await textToSpeech(text);
        
        if (requestId !== requestRef.current) {
            return; // A new request has been made, so this one is cancelled.
        }
        
        if (audioData) {
            await playAudio(audioData, handleAudioEnded);
        } else {
            handleAudioEnded();
        }
    }, [handleAudioEnded]);

    const stop = useCallback(() => {
        requestRef.current++; // Invalidate any ongoing fetch requests
        stopAudio();
        handleAudioEnded();
    }, [handleAudioEnded]);

    const value = { currentlyPlayingId, isLoading, play, stop };
    
    return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};
