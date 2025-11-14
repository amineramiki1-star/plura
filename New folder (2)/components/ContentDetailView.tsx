import React, { useState, useEffect, useRef } from 'react';
import type { ContentItem } from '../types';
import { getImageUrl, fetchVideos } from '../services/tmdbService';
import { useLibrary } from '../services/libraryService';
import { XIcon, PlayIcon, BookmarkIcon, StarIcon, CalendarIcon } from './icons';
import { useFocus, useFocusable } from '../hooks/useFocus';

interface ContentDetailViewProps {
  item: ContentItem;
  onClose: () => void;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({ item, onClose }) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(true);
  const [showNoTrailerMessage, setShowNoTrailerMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToLibrary, removeFromLibrary, isInLibrary } = useLibrary();
  const { trapFocus, releaseFocus } = useFocus();
  const detailViewRef = useRef<HTMLDivElement>(null);
  const noTrailerMessageTimerRef = useRef<number | null>(null);

  const { focusableProps: closeButtonProps } = useFocusable({ id: `detail-close-${item.id}`, isCircle: true });
  const { focusableProps: watchNowProps } = useFocusable({ id: `detail-watch-${item.id}` });
  const { focusableProps: playTrailerProps } = useFocusable({ id: `detail-trailer-${item.id}` });
  const { focusableProps: addToListProps } = useFocusable({ id: `detail-add-${item.id}` });

  const isSaved = isInLibrary(item.id);

  useEffect(() => {
    const getTrailer = async () => {
      setIsTrailerLoading(true);
      setShowNoTrailerMessage(false);
      const video = await fetchVideos(item.id, item.type);
      setTrailerKey(video?.key ?? null);
      setIsTrailerLoading(false);
    };
    getTrailer();
  }, [item.id, item.type]);

  useEffect(() => {
    if (detailViewRef.current) {
      trapFocus(detailViewRef.current);
    }
    return () => {
      releaseFocus();
    };
  }, [trapFocus, releaseFocus]);
  
  useEffect(() => {
    return () => {
      if (noTrailerMessageTimerRef.current) {
        clearTimeout(noTrailerMessageTimerRef.current);
      }
    };
  }, []);

  const handlePlayTrailer = () => {
    if (trailerKey) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
      window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
    } else {
      if (noTrailerMessageTimerRef.current) {
        clearTimeout(noTrailerMessageTimerRef.current);
      }
      setShowNoTrailerMessage(true);
      noTrailerMessageTimerRef.current = window.setTimeout(() => {
        setShowNoTrailerMessage(false);
      }, 3000);
    }
  };
  
  const handleToggleLibrary = () => {
    if (!isSaved) {
      addToLibrary(item);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 700); // Animation duration
    } else {
      removeFromLibrary(item.id);
    }
  };

  const handleWatchNow = () => {
    const typeString = item.type === 'tv' ? 'TV show' : 'movie';
    const query = `where to stream ${item.title} ${typeString}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      ref={detailViewRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-30 flex items-center justify-center animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-full max-h-[80vh] bg-black/30 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row overflow-hidden relative text-white"
        onClick={e => e.stopPropagation()}
      >
        <button 
          {...closeButtonProps} 
          onClick={onClose} 
          className={`${closeButtonProps.className} absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-white/20 transition-colors`}
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="w-full md:w-2/5 h-1/2 md:h-full flex-shrink-0">
          <img src={getImageUrl(item.posterPath, 'w780')} alt={item.title} className="w-full h-full object-cover shadow-2xl shadow-cyan-500/20"/>
        </div>

        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400">{item.title}</h2>
          
          {item.releaseDate && (
            <div className="flex items-center text-sm text-cyan-300 mt-3">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                    {new Date(item.releaseDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </span>
            </div>
          )}

          <div className="flex items-center my-4">
              <StarIcon className="w-8 h-8 text-yellow-400 fill-current" />
              <span className="ml-2 text-2xl md:text-3xl font-bold text-white">{item.rating.toFixed(1)}</span>
              <span className="ml-1 text-lg md:text-xl text-gray-400">/ 10</span>
          </div>

          <div className="flex-grow text-gray-300 mb-6 pr-2 overflow-y-auto">
            <p>{item.description}</p>
          </div>

          <div className="mt-auto flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/10">
            <button
                {...watchNowProps}
                onClick={() => {
                  watchNowProps.onClick();
                  handleWatchNow();
                }}
                className={`${watchNowProps.className} flex-grow md:flex-grow-0 flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-300`}
            >
                <PlayIcon className="w-6 h-6"/>
                <span>Watch Now</span>
            </button>
            <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
              <button 
                {...playTrailerProps}
                onClick={() => {
                  playTrailerProps.onClick();
                  handlePlayTrailer();
                }}
                disabled={isTrailerLoading}
                className={`${playTrailerProps.className} w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white font-bold text-sm transition-all hover:bg-cyan-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-wait`}
              >
                <PlayIcon className="w-6 h-6"/>
                <span>{isTrailerLoading ? 'Loading...' : 'Play Trailer'}</span>
              </button>
              {showNoTrailerMessage && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-500/90 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap animate-fade-in">
                      No trailer available.
                  </div>
              )}
            </div>
            <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
              <button
                {...addToListProps}
                onClick={() => {
                  addToListProps.onClick();
                  handleToggleLibrary();
                }}
                className={`${addToListProps.className} w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full backdrop-blur-lg border border-white/20 text-white font-bold text-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isSaved ? 'bg-cyan-500/50' : 'bg-white/10 hover:bg-cyan-500/50'}`}
              >
                <BookmarkIcon className={`w-6 h-6 transition-all duration-300 ease-in-out ${isSaved ? 'fill-current text-cyan-400 scale-110 rotate-12' : ''}`} />
                <span>{isSaved ? "In My List" : "Add to List"}</span>
              </button>
              {isAnimating && (
                <div className="particle-container">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const angle = (i / 10) * 360;
                    const radius = Math.random() * 25 + 25; // Random radius between 25 and 50
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    const colors = ['#06b6d4', '#d946ef', '#ec4899', '#f59e0b', '#84cc16'];
                    const color = colors[i % colors.length];

                    return (
                      <div
                        key={i}
                        className="particle"
                        style={{
                          // @ts-ignore
                          '--x': `${x}px`,
                          '--y': `${y}px`,
                          background: color,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};