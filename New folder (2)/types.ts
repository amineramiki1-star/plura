export interface ContentItem {
  id: number;
  title: string;
  description: string;
  rating: number;
  posterPath: string | null;
  type: 'movie' | 'tv';
  genres: { id: number; name: string; }[];
  releaseDate?: string;
}

export type MessageAuthor = 'user' | 'gemini';

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

export type View = 'movies' | 'tv' | 'anime' | 'library';

export type MovieCategory = 'top_rated' | 'popular' | 'upcoming' | 'now_playing';
export type TvShowCategory = 'top_rated' | 'popular' | 'airing_today' | 'on_the_air';
export type AnimeCategory = 'top_rated' | 'popular';