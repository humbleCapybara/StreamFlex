import React, { useState, useEffect, forwardRef } from 'react';
import { Bookmark, Heart, Star } from 'lucide-react';
import { getImageUrl } from '../utils/tmdb';
import './MovieCard.css';

export const getRatingColorClass = (rating) => {
  if (!rating) return '';
  if (rating >= 7.0) return 'rating-good';
  if (rating >= 5.0) return 'rating-decent';
  return 'rating-bad';
};

const MovieCard = forwardRef(({ item, onClick, isBento, isRow }, ref) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkWatchlist = () => {
      const currentWatchlist = JSON.parse(localStorage.getItem('watchlistMovies') || '[]');
      setInWatchlist(currentWatchlist.some(m => m.id === item.id));
    };
    const checkLiked = () => {
      const currentLiked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
      setIsLiked(currentLiked.some(m => m.id === item.id));
    };
    
    checkWatchlist();
    checkLiked();
    window.addEventListener('watchlistUpdated', checkWatchlist);
    window.addEventListener('likedMoviesUpdated', checkLiked);
    return () => {
      window.removeEventListener('watchlistUpdated', checkWatchlist);
      window.removeEventListener('likedMoviesUpdated', checkLiked);
    };
  }, [item.id]);

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    const currentWatchlist = JSON.parse(localStorage.getItem('watchlistMovies') || '[]');
    let newWatchlist;
    if (inWatchlist) {
      newWatchlist = currentWatchlist.filter(m => m.id !== item.id);
    } else {
      newWatchlist = [...currentWatchlist, item];
    }
    localStorage.setItem('watchlistMovies', JSON.stringify(newWatchlist));
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  const toggleLiked = (e) => {
    e.stopPropagation();
    const currentLiked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    let newLiked;
    if (isLiked) {
      newLiked = currentLiked.filter(m => m.id !== item.id);
    } else {
      newLiked = [...currentLiked, item];
    }
    localStorage.setItem('likedMovies', JSON.stringify(newLiked));
    window.dispatchEvent(new Event('likedMoviesUpdated'));
  };

  return (
    <div 
      ref={ref}
      className={`poster-card ${isBento ? 'bento-card' : ''} ${isRow ? 'row-mode' : 'grid-mode'}`}
      onClick={onClick}
    >
      <div className={`poster-img-container`}>
        <img 
          src={getImageUrl(item.poster_path, 'w500')} 
          alt={item.title || item.name} 
          className="poster-img"
          loading="lazy"
        />
        
        {isBento && (
          <>
            <button 
              className={`btn-bento-watchlist ${inWatchlist ? 'active' : ''}`}
              onClick={toggleWatchlist}
              title="Add to Watchlist"
            >
              <Bookmark size={20} fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
            <button 
              className={`btn-bento-liked ${isLiked ? 'active' : ''}`}
              onClick={toggleLiked}
              title="Like"
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <div className="grid-card-hover-title">
              <h3 className="bento-title" title={item.title || item.name}>{item.title || item.name}</h3>
              <span className="bento-rating">
                <Star size={14} fill="currentColor" /> {item.vote_average?.toFixed(1)}
              </span>
            </div>
          </>
        )}
      </div>
      
      {!isBento && (
        <div className="poster-info">
          <div className="poster-header">
            <h4 className="movie-title" title={item.title || item.name}>{item.title || item.name}</h4>
            <div className="poster-actions">
              <button 
                className={`btn-action-small ${isLiked ? 'active-liked' : ''}`}
                onClick={toggleLiked}
                title="Like"
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button 
                className={`btn-action-small ${inWatchlist ? 'active-watch' : ''}`}
                onClick={toggleWatchlist}
                title="Add to Watchlist"
              >
                <Bookmark size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <div className="movie-details">
            <span className={`movie-rating ${getRatingColorClass(item.vote_average)}`}>
              Rating: {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'} / 10
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default MovieCard;
