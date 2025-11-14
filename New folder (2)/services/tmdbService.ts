import type { ContentItem, MovieCategory, TvShowCategory, AnimeCategory } from '../types';

// API Configuration for The Movie Database (TMDb)
const TMDB_API_KEY = '10096d4629442c58374f9fca009b299e';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

let genreCache: { movie: Map<number, string>, tv: Map<number, string> } | null = null;

// Helper to get image URL with specific size
export const getImageUrl = (path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) {
        return `https://placehold.co/500x750/0f172a/94a3b8?text=No+Image`;
    }
    return `${IMAGE_BASE_URL}${size}${path}`;
}

// Interface for the TMDb API response items
interface TmdbResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  overview: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids?: number[];
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
}

interface TmdbVideoResult {
  key: string;
  site: string;
  type: string;
  name?: string;
}

// Generic fetch function for TMDb API
const fetchData = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  });
  const url = `${API_BASE_URL}${endpoint}?${urlParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.status_message || response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw new Error('Could not connect to the media service. Please check your network connection.');
  }
};


const getGenreMaps = async (): Promise<{ movie: Map<number, string>, tv: Map<number, string> }> => {
    if (genreCache) {
        return genreCache;
    }

    const [movieGenresData, tvGenresData] = await Promise.all([
        fetchData('/genre/movie/list'),
        fetchData('/genre/tv/list')
    ]);
    
    const movieGenreMap = new Map<number, string>();
    movieGenresData.genres.forEach((genre: {id: number, name: string}) => movieGenreMap.set(genre.id, genre.name));
    
    const tvGenreMap = new Map<number, string>();
    tvGenresData.genres.forEach((genre: {id: number, name: string}) => tvGenreMap.set(genre.id, genre.name));

    genreCache = { movie: movieGenreMap, tv: tvGenreMap };
    return genreCache;
}


// Mapper function to transform TMDb data into our app's ContentItem format
const mapResultToContentItem = (result: TmdbResult, type: 'movie' | 'tv', genreMap: Map<number, string>): ContentItem => {
  const title = type === 'movie' ? result.title : result.name;
  const genres = (result.genre_ids || [])
    .map(id => ({ id, name: genreMap.get(id) || 'Unknown' }))
    .filter(g => g.name !== 'Unknown')
    .slice(0, 3);

  return {
    id: result.id,
    title: title || 'Untitled',
    description: result.overview || 'No description available.',
    rating: result.vote_average,
    posterPath: result.poster_path,
    type: type,
    genres: genres,
    releaseDate: result.release_date || result.first_air_date,
  };
};

// Fetch movies by category
export const fetchMovies = async (category: MovieCategory, page: number = 1): Promise<ContentItem[]> => {
  const genreMaps = await getGenreMaps();
  const endpoint = `/movie/${category}`;
  const data = await fetchData(endpoint, { page: String(page) });
  const results: TmdbResult[] = data.results || [];
  return results.map(result => mapResultToContentItem(result, 'movie', genreMaps.movie));
};

// Fetch TV shows by category
export const fetchTvShows = async (category: TvShowCategory, page: number = 1): Promise<ContentItem[]> => {
  const genreMaps = await getGenreMaps();
  const endpoint = `/tv/${category}`;
  const data = await fetchData(endpoint, { page: String(page) });
  const results: TmdbResult[] = data.results || [];
  return results.map(result => mapResultToContentItem(result, 'tv', genreMaps.tv));
};

// Fetch Anime by category
export const fetchAnime = async (category: AnimeCategory, page: number = 1): Promise<ContentItem[]> => {
  const genreMaps = await getGenreMaps();
  const sortBy = category === 'popular' ? 'popularity.desc' : 'vote_average.desc';
  const params = {
    with_genres: '16', // Animation
    with_keywords: '210024', // Anime
    sort_by: sortBy,
    'vote_count.gte': category === 'top_rated' ? '500' : '100',
    with_original_language: 'ja',
    page: String(page)
  };
  const data = await fetchData('/discover/tv', params);
  const results: TmdbResult[] = data.results || [];
  return results.map(result => mapResultToContentItem(result, 'tv', genreMaps.tv));
};

// Fetch videos for a movie or TV show
export const fetchVideos = async (contentId: number, type: 'movie' | 'tv'): Promise<{key: string} | null> => {
    const endpoint = `/${type}/${contentId}/videos`;
    try {
        const data = await fetchData(endpoint);
        const results: TmdbVideoResult[] = data.results || [];
        
        // Prioritize official trailers, then fall back to other types
        const trailer = results.find(video => video.site === 'YouTube' && video.type === 'Trailer');
        const official = results.find(video => video.site === 'YouTube' && video.name?.toLowerCase().includes('official trailer'));
        const teaser = results.find(video => video.site === 'YouTube' && video.type === 'Teaser');
        const firstYouTubeVideo = results.find(video => video.site === 'YouTube');
        
        const bestVideo = trailer || official || teaser || firstYouTubeVideo;

        return bestVideo ? { key: bestVideo.key } : null;
    } catch (error) {
        console.error(`Error fetching videos for ${type} ${contentId}:`, error);
        return null;
    }
};