import React from 'react';
import type { ContentItem } from '../types';
import { getImageUrl } from '../services/tmdbService';
import { StarIcon, CalendarIcon } from './icons';
import { useFocusable } from '../hooks/useFocus';

interface MovieCardProps {
  movie: ContentItem;
  onSelect: (item: ContentItem) => void;
  showReleaseDate?: boolean;
  category: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, showReleaseDate = false, category }) => {
  const { focusableProps } = useFocusable({ id: `card-${category}-${movie.id}` });

  const handleCardClick = () => {
    focusableProps.onClick();
    onSelect(movie);
  };


  return (
    <button
      {...focusableProps}
      onClick={handleCardClick}
      className={`${focusableProps.className} w-full text-left focus:outline-none`}
      aria-label={movie.title}
    >
      <div className="w-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-left">
        <img src={getImageUrl(movie.posterPath, 'w500')} alt={movie.title} className="w-full h-48 md:h-56 lg:h-72 object-cover" />
        <div className="p-4">
          <h3 className="text-lg md:text-xl font-bold truncate text-white">{movie.title}</h3>
          <div className="flex items-center mt-2">
              <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1.5 text-sm font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>

          {showReleaseDate && movie.releaseDate && (
            <div className="flex items-center text-xs text-cyan-300 mt-2">
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              <span>
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          {movie.genres && movie.genres.length > 0 && (
              <p className={`text-xs text-gray-400 truncate ${showReleaseDate && movie.releaseDate ? 'mt-1' : 'mt-2'}`}>
                {movie.genres.map(g => g.name).join(' ・ ')}
              </p>
          )}
        </div>
      </div>
    </button>
  );
};
