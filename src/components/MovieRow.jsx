import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTMDB } from '../utils/tmdb';
import MovieCard from './MovieCard';
import './MovieRow.css';

const getRatingColorClass = (rating) => {
  if (!rating) return '';
  if (rating >= 7.0) return 'rating-good';
  if (rating >= 5.0) return 'rating-decent';
  return 'rating-bad';
};

const MovieRow = ({ title, endpoint, onMediaClick }) => {
  const [movies, setMovies] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTMDB(endpoint);
      if (data && data.results) {
        setMovies(data.results);
      }
    };
    fetchData();
  }, [endpoint]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth + 100 : clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="movie-row-container">
      <h2 className="row-title">{title}</h2>
      
      <div className="row-wrapper">
        <button className="slider-btn left glass" onClick={() => handleScroll('left')}>
          <ChevronLeft size={32} />
        </button>
        
        <div className="row-posters" ref={rowRef}>
          {movies.map((movie) => (
            movie.poster_path && (
              <MovieCard 
              key={movie.id} 
              item={movie} 
              isRow={true}
              onClick={() => onMediaClick && onMediaClick(movie)}
            />
            )
          ))}
        </div>

        <button className="slider-btn right glass" onClick={() => handleScroll('right')}>
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
