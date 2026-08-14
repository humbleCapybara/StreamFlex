import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import MovieRow from './components/MovieRow';
import MovieDetails from './components/MovieDetails';
import GridView from './components/GridView';
import Footer from './components/Footer';
import { endpoints, createSession, getAccountDetails } from './utils/tmdb';
import { API_BASE_URL } from './utils/config';
import './App.css';
import './Loading.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('movies');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [gridConfig, setGridConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const requestToken = urlParams.get('request_token');
      const approved = urlParams.get('approved');
      
      if (requestToken && approved === 'true') {
        window.history.replaceState({}, document.title, window.location.pathname);
        const sessionId = await createSession(requestToken);
        if (sessionId) {
          const account = await getAccountDetails(sessionId);
          if (account) {
            try {
              const res = await fetch(`${API_BASE_URL}/api/users/tmdb`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: account.username, tmdb_id: account.id })
              });
              if (res.ok) {
                const data = await res.json();
                const userObj = { ...account, localUserId: data.userId, sessionId, finalUsername: data.username };
                setCurrentUser(userObj);
                localStorage.setItem('currentUser', JSON.stringify(userObj));
              } else {
                console.warn('Backend sync failed, using local session');
                const userObj = { ...account, sessionId };
                setCurrentUser(userObj);
                localStorage.setItem('currentUser', JSON.stringify(userObj));
              }
            } catch (err) {
              console.error('Failed to sync user to backend', err);
              const userObj = { ...account, sessionId };
              setCurrentUser(userObj);
              localStorage.setItem('currentUser', JSON.stringify(userObj));
            }
          }
        }
      }
    };
    handleAuthRedirect();
  }, []);



  const handleViewChange = (view) => {
    if (view === activeView && !selectedMedia && !gridConfig) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveView(view);
      setSelectedMedia(null);
      setGridConfig(null);
      setTimeout(() => setIsTransitioning(false), 200);
    }, 400);
  };

  const handleGridOpen = (title, endpoint, defaultMediaType, isBento = false, localStoreKey = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setGridConfig({ title, endpoint, defaultMediaType, isBento, localStoreKey });
      setSelectedMedia(null);
      setTimeout(() => setIsTransitioning(false), 200);
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMedia(null);
      setTimeout(() => setIsTransitioning(false), 200);
    }, 400);
  };

  const handleMediaClick = (media) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMedia(media);
      setTimeout(() => setIsTransitioning(false), 200);
    }, 400);
  };

  useEffect(() => {
    const handleLoad = () => {
      // Small 500ms delay after everything loads for a smooth visual transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // Check if the page has already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      // Failsafe in case 'load' doesn't fire or takes too long (10 seconds)
      const fallbackTimer = setTimeout(handleLoad, 10000);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);



  return (
    <div className="app-container">
      {/* Cinematic Loading Screen */}
      <div className={`loading-screen ${isLoading ? '' : 'fade-out'}`}>
        <div className="loading-content">
          <div className="line-loader-container">
            <div className="line-loader"></div>
          </div>
        </div>
      </div>

      <Navbar 
        activeView={activeView} 
        setActiveView={handleViewChange} 
        onMediaClick={handleMediaClick}
        onOpenGrid={handleGridOpen}
        currentUser={currentUser}
      />
      
      <main className="main-content">
        {isTransitioning && (
          <div className="view-loader-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          
          {selectedMedia ? (
            <MovieDetails 
              media={selectedMedia} 
              onBack={handleBack} 
              currentUser={currentUser}
            />
          ) : gridConfig ? (
            <GridView 
              config={gridConfig} 
              onMediaClick={handleMediaClick}
            />
          ) : (
            <>
              <HeroSlider activeView={activeView} onMediaClick={handleMediaClick} />
              
              <div className="rows-container">
          {activeView === 'movies' && (
            <>
              <MovieRow title="Trending Movies" endpoint={endpoints.popular} onMediaClick={handleMediaClick} />
              <MovieRow title="Recently Added" endpoint={endpoints.recentlyAdded} onMediaClick={handleMediaClick} />
              <MovieRow title="Action Movies" endpoint={endpoints.action} onMediaClick={handleMediaClick} />
              <MovieRow title="Comedy Movies" endpoint={endpoints.comedy} onMediaClick={handleMediaClick} />
              <MovieRow title="Sci-Fi Movies" endpoint={endpoints.scifi} onMediaClick={handleMediaClick} />
              <MovieRow title="Recommended for you" endpoint={endpoints.recommended} onMediaClick={handleMediaClick} />
            </>
          )}

          {activeView === 'tvShows' && (
            <>
              <MovieRow title="Trending TV Shows" endpoint={endpoints.tvTrending} onMediaClick={handleMediaClick} />
              <MovieRow title="Popular TV Shows" endpoint={endpoints.tvPopular} onMediaClick={handleMediaClick} />
              <MovieRow title="Action & Adventure" endpoint={endpoints.tvAction} onMediaClick={handleMediaClick} />
              <MovieRow title="Comedy Series" endpoint={endpoints.tvComedy} onMediaClick={handleMediaClick} />
              <MovieRow title="Sci-Fi & Fantasy" endpoint={endpoints.tvSciFi} onMediaClick={handleMediaClick} />
              <MovieRow title="Highly Rated Series" endpoint={endpoints.tvRecommended} onMediaClick={handleMediaClick} />
            </>
          )}

          {activeView === 'documentaries' && (
            <>
              <MovieRow title="Popular Documentaries" endpoint={endpoints.docTrending} onMediaClick={handleMediaClick} />
              <MovieRow title="Top Rated Documentaries" endpoint={endpoints.docTopRated} onMediaClick={handleMediaClick} />
              <MovieRow title="Recently Added" endpoint={endpoints.docRecent} onMediaClick={handleMediaClick} />
              <MovieRow title="English Documentaries" endpoint={endpoints.docEnglish} onMediaClick={handleMediaClick} />
            </>
          )}
        </div>
            </>
          )}
        </div>
      </main>

      <Footer setActiveView={handleViewChange} />
    </div>
  );
}

export default App;
