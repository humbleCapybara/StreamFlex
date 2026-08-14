import React, { useState, useEffect } from 'react';
import { 
  AlignLeft, Search, User, ChevronDown, ChevronUp,
  Flame, Bookmark, History, Star, Film, Grid, Zap, Smile, Eye, Rocket, Heart, Ghost, Video, Tv, MoreHorizontal, ChevronRight, Settings, Orbit, Home
} from 'lucide-react';
import { searchTMDB, getImageUrl, endpoints, createRequestToken } from '../utils/tmdb';
import './Navbar.css';

const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
];

const Navbar = ({ activeView, setActiveView, onMediaClick, onOpenGrid, currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLoginClick = async () => {
    const token = await createRequestToken();
    if (token) {
      window.location.href = `https://www.themoviedb.org/authenticate/${token}?redirect_to=${window.location.origin}`;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchTMDB(searchQuery);
      if (data && data.results) {
        const filtered = data.results
          .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path))
          .slice(0, 5);
        setSearchResults(filtered);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);



  return (
    <div className={`navbar-wrapper ${!isVisible ? 'hidden' : ''}`}>
      <button 
        className="floating-menu-btn"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Open Menu"
      >
        <AlignLeft size={24} color="#fff" />
      </button>

      <nav className="navbar capsule">
        <div className="capsule-left">
          <div className="logo-circle">
            <Orbit size={24} color="#1a1a1a" strokeWidth={2.5} />
          </div>
        </div>

        <div className="capsule-center">
          <div className="navbar-quick-links">
            <a href="#movies" className={activeView === 'movies' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('movies'); }}>
              Movies
            </a>
            <a href="#tvshows" className={activeView === 'tvShows' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('tvShows'); }}>
              TV Shows
            </a>
            <a href="#documentaries" className={activeView === 'documentaries' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('documentaries'); }}>
              Documentaries
            </a>
          </div>
        </div>

        <div className="capsule-right">
          <div className="search-container capsule-search">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            
            {isSearchFocused && searchQuery.trim() && (
              <div className="search-suggestions glass">
                {isSearching ? (
                  <div className="search-suggestion-item loading">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div 
                      className="search-suggestion-item" 
                      key={result.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsSearchFocused(false);
                        setSearchQuery('');
                        onMediaClick && onMediaClick(result);
                      }}
                    >
                      <img 
                        src={getImageUrl(result.poster_path || result.backdrop_path, 'w92')} 
                        alt={result.title || result.name} 
                        className="suggestion-img"
                      />
                      <span className="suggestion-title">{result.title || result.name}</span>
                      <ChevronRight size={20} strokeWidth={3} className="suggestion-arrow" />
                    </div>
                  ))
                ) : (
                  <div className="search-suggestion-item empty">No results found</div>
                )}
              </div>
            )}
          </div>
          
          <div className="auth-capsule-group">
            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <div 
                  className="user-profile-circle"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {currentUser.avatar?.tmdb?.avatar_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${currentUser.avatar.tmdb.avatar_path}`} 
                      alt="Profile" 
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={20} color="#fff" />
                  )}
                </div>
                {isProfileOpen && (
                  <div className="profile-popup glass">
                    <p className="profile-username">{currentUser.finalUsername || currentUser.username}</p>
                    <p className="profile-id">TMDB ID: {currentUser.id}</p>
                  </div>
                )}
              </div>
            ) : (
              <button className="capsule-btn signup" onClick={handleLoginClick}>Sign Up</button>
            )}
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div 
        className={`side-menu glass-dropdown ${isMenuOpen ? 'open' : ''}`}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <button className="close-btn" onClick={() => setIsMenuOpen(false)}>&times;</button>
        <ul className="menu-links">
          <li>
            <a href="#home" onClick={(e) => {
              e.preventDefault();
              setActiveView('movies');
              setIsMenuOpen(false);
            }}>
              <Home size={20} /> Home
            </a>
          </li>
          <li>
            <a href="#trending" onClick={(e) => {
              e.preventDefault();
              const endpoint = activeView === 'tvShows' ? endpoints.tvTrending : endpoints.trending;
              const title = activeView === 'tvShows' ? 'Trending TV Shows' : 'Trending Movies';
              if (onOpenGrid) onOpenGrid(title, endpoint, activeView === 'tvShows' ? 'tv' : 'movie', true);
              setIsMenuOpen(false);
            }}>
              <Flame size={20} /> Trending
            </a>
          </li>
          <li>
            <a href="#watchlist" onClick={(e) => {
              e.preventDefault();
              if (onOpenGrid) onOpenGrid('My Watchlist', null, 'movie', false, 'watchlistMovies');
              setIsMenuOpen(false);
            }}>
              <Bookmark size={20} /> Watchlist
            </a>
          </li>
          <li><a href="#history"><History size={20} /> Watch history</a></li>
          <li>
            <a href="#liked" onClick={(e) => {
              e.preventDefault();
              if (onOpenGrid) onOpenGrid('Liked Movies', null, 'movie', false, 'likedMovies');
              setIsMenuOpen(false);
            }}>
              <Heart size={20} /> Liked movies
            </a>
          </li>
          <li>
            <div 
              className="submenu-toggle" 
              onClick={() => setIsGenreOpen(!isGenreOpen)}
            >
              <div className="submenu-title-with-icon">
                <Grid size={20} /> <span>Genre</span>
              </div>
              {isGenreOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <ul className={`submenu ${isGenreOpen ? 'open' : ''}`}>
              {(activeView === 'tvShows' ? TV_GENRES : MOVIE_GENRES).map(genre => (
                <li key={genre.id}>
                  <a href={`#genre-${genre.id}`} onClick={(e) => {
                    e.preventDefault();
                    if (onOpenGrid) {
                      onOpenGrid(
                        `${genre.name} ${activeView === 'tvShows' ? 'TV Shows' : 'Movies'}`,
                        `/discover/${activeView === 'tvShows' ? 'tv' : 'movie'}?with_genres=${genre.id}&sort_by=popularity.desc&page=1`,
                        activeView === 'tvShows' ? 'tv' : 'movie'
                      );
                    }
                    setIsMenuOpen(false);
                  }}>
                    <ChevronRight size={14} /> {genre.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
