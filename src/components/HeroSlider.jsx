import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { fetchTMDB, endpoints, getImageUrl, fetchMediaDetails } from '../utils/tmdb';
import { X } from 'lucide-react';
import './HeroSlider.css';

const HeroSlider = ({ activeView, onMediaClick }) => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      let endpoint = endpoints.trending;
      if (activeView === 'tvShows') endpoint = endpoints.tvTrending;
      if (activeView === 'documentaries') endpoint = endpoints.docTrending;

      const data = await fetchTMDB(endpoint);
      if (data && data.results) {
        setMovies(data.results.slice(0, 5)); // Take top 5 for the slider
        setCurrentIndex(0); // Reset index when view changes
      }
    };
    fetchHeroContent();
  }, [activeView]);

  useEffect(() => {
    if (movies.length === 0 || showTrailer) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000); // 5s auto slide
    
    return () => clearInterval(interval);
  }, [movies, showTrailer]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const playTrailer = async () => {
    if (!movies[currentIndex]) return;
    const movie = movies[currentIndex];
    const type = activeView === 'tvShows' ? 'tv' : 'movie';
    
    setIsTrailerLoading(true);
    const details = await fetchMediaDetails(movie.id, type);
    
    if (details && details.videos && details.videos.results.length > 0) {
      // Find a youtube trailer
      const trailer = details.videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');
      const backup = details.videos.results.find(vid => vid.site === 'YouTube'); // fallback to any youtube video
      
      const selectedVideo = trailer || backup;
      
      if (selectedVideo) {
        setTrailerKey(selectedVideo.key);
        setShowTrailer(true);
      } else {
        alert("No trailer available for this title.");
      }
    } else {
      alert("No trailer available for this title.");
    }
    setIsTrailerLoading(false);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
  };

  if (movies.length === 0) {
    return <div className="hero-slider-loading">Loading...</div>;
  }

  const movie = movies[currentIndex];
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');

  return (
    <div className="hero-slider">
      <div 
        className="hero-background" 
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="hero-gradient"></div>
      </div>

      <div className="hero-content">
        <div className="hero-info">
          <h1 className="hero-title">{movie.title || movie.name}</h1>
          <p className="hero-overview">{movie.overview}</p>
          
          <div className="hero-actions">
            <button 
              className={`btn-play ${isTrailerLoading ? 'loading' : ''}`}
              onClick={playTrailer}
              disabled={isTrailerLoading}
            >
              <Play fill="currentColor" size={20} />
              {isTrailerLoading ? 'Loading...' : 'Play'}
            </button>
            <button 
              className="btn-info glass"
              onClick={() => onMediaClick && onMediaClick(movie)}
            >
              <Info size={20} />
              More Info
            </button>
          </div>
        </div>

        <div className="hero-controls">
          <button className="control-btn glass" onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>
          <button className="control-btn glass" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      <div className="hero-indicators">
        {movies.map((_, idx) => (
          <div 
            key={idx} 
            className={`indicator ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      {showTrailer && trailerKey && (
        <div className="trailer-modal-overlay" onClick={closeTrailer}>
          <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={closeTrailer}>
              <X size={24} />
            </button>
            <div className="trailer-iframe-container">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
