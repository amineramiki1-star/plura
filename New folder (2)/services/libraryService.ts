import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ContentItem } from '../types';

interface LibraryContextType {
  libraryItems: ContentItem[];
  addToLibrary: (item: ContentItem) => void;
  removeFromLibrary: (itemId: number) => void;
  isInLibrary: (itemId: number) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [libraryItems, setLibraryItems] = useState<ContentItem[]>(() => {
    try {
      const items = window.localStorage.getItem('movie-library');
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error("Could not parse library from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('movie-library', JSON.stringify(libraryItems));
    } catch (error) {
      console.error("Could not save library to localStorage", error);
    }
  }, [libraryItems]);

  const addToLibrary = (item: ContentItem) => {
    setLibraryItems((prevItems) => {
      if (prevItems.find(i => i.id === item.id)) {
        return prevItems; // Already exists
      }
      return [...prevItems, item];
    });
  };

  const removeFromLibrary = (itemId: number) => {
    setLibraryItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };
  
  const isInLibrary = (itemId: number) => {
    return libraryItems.some(item => item.id === itemId);
  };

  const value = { libraryItems, addToLibrary, removeFromLibrary, isInLibrary };

  // FIX: Replaced JSX with `React.createElement` to resolve syntax errors in a `.ts` file. The file should ideally be renamed to `.tsx` to use JSX directly.
  return React.createElement(LibraryContext.Provider, { value }, children);
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
