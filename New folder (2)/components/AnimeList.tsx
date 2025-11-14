import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import type { ContentItem, AnimeCategory } from '../types';
import { fetchAnime } from '../services/tmdbService';
import { CategoryTabs } from './CategoryTabs';

const animeCategories: { id: AnimeCategory; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
];

interface AnimeListProps {
  onItemSelected: (item: ContentItem) => void;
}

export const AnimeList: React.FC<AnimeListProps> = ({ onItemSelected }) => {
  const [animeList, setAnimeList] = useState<ContentItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>('popular');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  const loadAnime = useCallback(async (category: AnimeCategory, pageNum: number) => {
    if (pageNum > 1 && isFetchingMore) return;

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    setError(null);
    try {
      const fetchedAnime = await fetchAnime(category, pageNum);
      if (fetchedAnime.length < 20) {
        setHasMore(false);
      }
      setAnimeList(prev => {
        if (pageNum === 1) {
          return fetchedAnime;
        }
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewAnime = fetchedAnime.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNewAnime];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      if (pageNum === 1) {
        setIsLoading(false);
      } else {
        setIsFetchingMore(false);
      }
    }
  }, [isFetchingMore]);

  useEffect(() => {
    setAnimeList([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadAnime(activeCategory, 1);
  }, [activeCategory]);
  
  useEffect(() => {
    if(page > 1) {
      loadAnime(activeCategory, page);
    }
  }, [page]);
  
  const handleCategoryChange = (category: AnimeCategory) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  const renderContent = () => {
    if (isLoading && animeList.length === 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4 md:px-8">
          {[...Array(12)].map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    
    if (error && animeList.length === 0) {
      return (
        <div className="flex items-center justify-center h-48">
            <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">
                <p className="font-bold">Error loading anime</p>
                <p className="text-sm">{error}</p>
            </div>
        </div>
      );
    }

    if (animeList.length === 0 && !isLoading && !isFetchingMore) {
      return (
          <div className="flex items-center justify-center h-48">
              <div className="text-center text-gray-400">
                  <p>No anime found.</p>
              </div>
          </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4 md:px-8">
          {animeList.map((anime) => (
            <MovieCard movie={anime} key={`${activeCategory}-${anime.id}`} onSelect={onItemSelected} category={activeCategory} />
          ))}
        </div>
        
        <div ref={loaderRef} />

        {isFetchingMore && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4 md:px-8 mt-6">
            {[...Array(6)].map((_, index) => <MovieCardSkeleton key={index} />)}
          </div>
        )}

        {!hasMore && animeList.length > 0 && (
          <p className="text-center text-gray-400 py-4">You've reached the end!</p>
        )}
        
        {error && animeList.length > 0 && (
          <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg mt-4">
            <p>Could not load more items.</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </>
    );
  };

  const currentCategoryLabel = animeCategories.find(c => c.id === activeCategory)?.label || 'Ranked';
  
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        {currentCategoryLabel} Anime
      </h1>
      <CategoryTabs 
        categories={animeCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      {renderContent()}
    </div>
  );
};