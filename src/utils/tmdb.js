const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch data
export const fetchTMDB = async (endpoint) => {
  if (!API_KEY) {
    console.warn('TMDB API Key is missing. Please set VITE_TMDB_API_KEY in .env');
    return { results: [] };
  }
  
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=en-US`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TMDB data:', error);
    return { results: [] };
  }
};

export const searchTMDB = async (query) => {
  if (!API_KEY) {
    console.warn('TMDB API Key is missing.');
    return { results: [] };
  }
  
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return { results: [] };
  }
};

export const fetchMediaDetails = async (id, type = 'movie') => {
  if (!API_KEY) return null;
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
};

export const endpoints = {
  trending: '/trending/movie/day',
  popular: '/movie/popular',
  action: '/discover/movie?with_genres=28',
  comedy: '/discover/movie?with_genres=35',
  scifi: '/discover/movie?with_genres=878',
  recentlyAdded: '/movie/now_playing',
  recommended: '/movie/top_rated',
  // TV Shows
  tvTrending: '/trending/tv/day',
  tvPopular: '/tv/popular',
  tvAction: '/discover/tv?with_genres=10759',
  tvComedy: '/discover/tv?with_genres=35',
  tvSciFi: '/discover/tv?with_genres=10765',
  tvRecommended: '/tv/top_rated',
  // Documentaries
  docTrending: '/discover/movie?with_genres=99&sort_by=popularity.desc',
  docTopRated: '/discover/movie?with_genres=99&sort_by=vote_average.desc&vote_count.gte=50',
  docRecent: '/discover/movie?with_genres=99&sort_by=release_date.desc&vote_count.gte=10',
  docEnglish: '/discover/movie?with_genres=99&with_original_language=en',
};

// Image URL helper
export const getImageUrl = (path, size = 'original') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// --- Authentication Helpers ---
export const createRequestToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/authentication/token/new?api_key=${API_KEY}`);
    const data = await response.json();
    return data.request_token;
  } catch (error) {
    console.error('Error creating request token:', error);
    return null;
  }
};

export const createSession = async (requestToken) => {
  try {
    const response = await fetch(`${BASE_URL}/authentication/session/new?api_key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_token: requestToken }),
    });
    const data = await response.json();
    return data.session_id;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
};

export const getAccountDetails = async (sessionId) => {
  try {
    const response = await fetch(`${BASE_URL}/account?api_key=${API_KEY}&session_id=${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching account details:', error);
    return null;
  }
};
