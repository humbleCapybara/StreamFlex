import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTMDB } from '../utils/tmdb';
import MovieCard from './MovieCard';
import './GridView.css';

const GridView = ({ config, onMediaClick }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [config]);

  useEffect(() => {
    if (!config) return;

    if (config.localStoreKey) {
      const loadLocalItems = () => {
        const localItems = JSON.parse(localStorage.getItem(config.localStoreKey) || '[]');
        setItems(localItems);
        setIsLoading(false);
        setHasMore(false);
      };
      
      loadLocalItems();
      
      const eventName = config.localStoreKey === 'watchlistMovies' ? 'watchlistUpdated' : 'likedMoviesUpdated';
      window.addEventListener(eventName, loadLocalItems);
      return () => window.removeEventListener(eventName, loadLocalItems);
    }
    const loadGridItems = async () => {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      let cleanEndpoint = config.endpoint.replace(/&page=\d+/, '').replace(/\?page=\d+/, '');
      const separator = cleanEndpoint.includes('?') ? '&' : '?';
      const fetchEndpoint = `${cleanEndpoint}${separator}page=${page}`;

      const data = await fetchTMDB(fetchEndpoint);
      if (data && data.results) {
        const validItems = data.results.filter(item => item.poster_path);
        if (page === 1) {
          setItems(validItems);
        } else {
          setItems(prev => [...prev, ...validItems]);
        }
        
        if (page >= (data.total_pages || 1000)) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
      setIsFetchingMore(false);
    };

    if (config.endpoint) loadGridItems();
  }, [config, page]);

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  if (!config) return null;

  return (
    <div className="grid-view">
      <div className="grid-header">
        <h1>{config.title}</h1>
      </div>
      
      {isLoading ? (
        <div className="grid-loader"><div className="spinner"></div></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>nothing to see here</p>
        </div>
      ) : (
        <div className={`grid-container ${config.isBento ? 'bento' : ''}`}>
          {items.map((item, index) => {
            const isLast = items.length === index + 1;
            return (
              <MovieCard 
                key={`${item.id}-${index}`}
                ref={isLast ? lastElementRef : null}
                item={item}
                isBento={config.isBento}
                isRow={false}
                onClick={() => onMediaClick && onMediaClick({ 
                  ...item, 
                  media_type: item.media_type || config.defaultMediaType || 'movie' 
                })}
              />
            );
          })}
        </div>
      )}
      
      {isFetchingMore && (
        <div className="grid-fetch-loader"><div className="spinner"></div></div>
      )}
    </div>
  );
};

export default GridView;
