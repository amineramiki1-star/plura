import React from 'react';
import { useLibrary } from '../services/libraryService';
import { MovieCard } from './MovieCard';
import type { ContentItem } from '../types';

interface MyListViewProps {
  onItemSelected: (item: ContentItem) => void;
}

export const MyListView: React.FC<MyListViewProps> = ({ onItemSelected }) => {
  const { libraryItems } = useLibrary();

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        My List
      </h1>
      
      {libraryItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4 md:px-8">
          {libraryItems.map((item) => (
            <MovieCard movie={item} key={`library-${item.id}`} onSelect={onItemSelected} category="library" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          <h2 className="text-2xl font-semibold">Your List is Empty</h2>
          <p className="mt-2 max-w-sm">Add movies and shows to your list to see them here.</p>
        </div>
      )}
    </div>
  );
};