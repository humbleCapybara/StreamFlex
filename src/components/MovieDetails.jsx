import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Play, Bookmark, Heart, User, ChevronLeft, ChevronRight, Trash2, Send } from 'lucide-react';
import { fetchMediaDetails, getImageUrl } from '../utils/tmdb';
import { API_BASE_URL } from '../utils/config';
import './MovieDetails.css';

const MovieDetails = ({ media, onBack, currentUser }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const castRowRef = useRef(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Comment state
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const scrollCast = (direction) => {
    if (castRowRef.current) {
      const { clientWidth } = castRowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      castRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadDetails = async () => {
      setIsLoading(true);
      const data = await fetchMediaDetails(media.id, media.type || media.media_type || 'movie');
      setDetails(data);
      setIsLoading(false);
    };
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/comments/${media.id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error('Failed to fetch comments', err);
      }
    };

    if (media) {
      loadDetails();
      fetchComments();
    }

    const checkWatchlist = () => {
      const currentWatchlist = JSON.parse(localStorage.getItem('watchlistMovies') || '[]');
      setInWatchlist(currentWatchlist.some(m => m.id === media.id));
    };
    const checkLiked = () => {
      const currentLiked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
      setIsLiked(currentLiked.some(m => m.id === media.id));
    };
    checkWatchlist();
    checkLiked();

    window.addEventListener('watchlistUpdated', checkWatchlist);
    window.addEventListener('likedMoviesUpdated', checkLiked);
    return () => {
      window.removeEventListener('watchlistUpdated', checkWatchlist);
      window.removeEventListener('likedMoviesUpdated', checkLiked);
    };
  }, [media]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;
    
    setIsSubmittingComment(true);
    try {
      const payload = {
        movieId: String(media.id),
        username: currentUser.finalUsername || currentUser.username,
        avatar: currentUser.avatar?.tmdb?.avatar_path ? `https://image.tmdb.org/t/p/w92${currentUser.avatar.tmdb.avatar_path}` : '',
        text: newCommentText,
        tmdb_id: String(currentUser.id)
      };
      
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [newComment, ...prev]); // Optimistic update, newest first
        setNewCommentText('');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to post comment: ${errorData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('Failed to post comment: Network error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdb_id: String(currentUser.id) })
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const toggleWatchlist = () => {
    const currentWatchlist = JSON.parse(localStorage.getItem('watchlistMovies') || '[]');
    let newWatchlist;
    if (inWatchlist) {
      newWatchlist = currentWatchlist.filter(m => m.id !== media.id);
    } else {
      newWatchlist = [...currentWatchlist, media];
    }
    localStorage.setItem('watchlistMovies', JSON.stringify(newWatchlist));
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  const toggleLiked = () => {
    const currentLiked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    let newLiked;
    if (isLiked) {
      newLiked = currentLiked.filter(m => m.id !== media.id);
    } else {
      newLiked = [...currentLiked, media];
    }
    localStorage.setItem('likedMovies', JSON.stringify(newLiked));
    window.dispatchEvent(new Event('likedMoviesUpdated'));
  };

  if (isLoading) {
    return (
      <div className="details-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!details) return null;

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const runtime = details.runtime ? `${details.runtime} min` : (details.number_of_seasons ? `${details.number_of_seasons} Seasons` : '');
  const trailer = details.videos?.results?.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');
  const cast = details.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="movie-details-page">
      <div 
        className="details-backdrop"
        style={{ backgroundImage: `url(${getImageUrl(details.backdrop_path, 'original')})` }}
      >
        <div className="backdrop-gradient"></div>
      </div>

      <div className="details-content">
        <div className="details-main">
          <div className="details-left">
            <img 
              src={getImageUrl(details.poster_path, 'w500')} 
              alt={title} 
              className="details-poster" 
            />
          </div>

          <div className="details-right">
            <h1 className="details-title">{title}</h1>
            {details.tagline && <p className="details-tagline">"{details.tagline}"</p>}
            
            <div className="details-meta">
              <span className="meta-item rating">
                <Star size={18} fill="currentColor" /> {details.vote_average?.toFixed(1)}
              </span>
              {releaseDate && (
                <span className="meta-item">
                  <Calendar size={18} /> {new Date(releaseDate).getFullYear()}
                </span>
              )}
              {runtime && (
                <span className="meta-item">
                  <Clock size={18} /> {runtime}
                </span>
              )}
            </div>

            <div className="details-genres">
              {details.genres?.map(g => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <div className="details-overview">
              <h3>Overview</h3>
              <p>{details.overview}</p>
            </div>

            <div className="details-actions">
              {trailer ? (
                <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer" className="btn-play-trailer">
                  <Play size={20} fill="currentColor" /> Play Trailer
                </a>
              ) : (
                <button className="btn-play-trailer disabled">No Trailer</button>
              )}
              <button 
                className={`btn-circle-action glass ${inWatchlist ? 'active' : ''}`}
                onClick={toggleWatchlist}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Bookmark size={24} fill={inWatchlist ? 'currentColor' : 'none'} /> 
              </button>
              <button 
                className={`btn-circle-action glass ${isLiked ? 'active' : ''}`}
                onClick={toggleLiked}
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} /> 
              </button>
            </div>

          </div>
        </div>

        {cast.length > 0 && (
          <div className="details-cast">
            <h3>Top Cast</h3>
            <div className="cast-container">
              <button 
                className="cast-nav-btn left glass" 
                onClick={() => scrollCast('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="cast-row" ref={castRowRef}>
                {cast.map(actor => (
                  <div key={actor.id} className="cast-card">
                    {actor.profile_path ? (
                      <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} />
                    ) : (
                      <div className="cast-placeholder"><User size={24}/></div>
                    )}
                    <p className="cast-name">{actor.name}</p>
                    <p className="cast-character">{actor.character}</p>
                  </div>
                ))}
              </div>

              <button 
                className="cast-nav-btn right glass" 
                onClick={() => scrollCast('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Comment Section */}
        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>
          
          {currentUser ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="comment-input-wrapper">
                <textarea 
                  placeholder="Share your thoughts about this movie..." 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  maxLength={1000}
                />
                <button 
                  type="submit" 
                  className={`btn-post-comment ${isSubmittingComment ? 'loading' : ''}`}
                  disabled={!newCommentText.trim() || isSubmittingComment}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt glass">
              <User size={24} color="rgba(255, 255, 255, 0.5)" />
              <p>Sign in with TMDB to leave a comment and join the discussion.</p>
            </div>
          )}

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment._id} className="comment-card glass">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.avatar ? (
                        <img src={comment.avatar} alt={comment.username} className="comment-avatar" />
                      ) : (
                        <div className="comment-avatar-placeholder"><User size={16}/></div>
                      )}
                      <span className="comment-username">{comment.username}</span>
                    </div>
                    <div className="comment-actions">
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {currentUser && String(currentUser.id) === comment.tmdb_id && (
                        <button 
                          className="btn-delete-comment" 
                          onClick={() => handleDeleteComment(comment._id)}
                          title="Delete your comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieDetails;
