import React from 'react';
import { Film } from 'lucide-react';
import './Footer.css';

const Footer = ({ setActiveView }) => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Film size={28} color="#a855f7" />
            <span>StreamFlex</span>
          </div>
          <p className="footer-description">
            Your ultimate destination for discovering and tracking the best movies, TV shows, and documentaries. Built with a passion for cinema.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Twitter">X</a>
            <a href="#" className="social-icon" aria-label="Instagram">IG</a>
            <a href="#" className="social-icon" aria-label="Mail">@</a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>Explore</h4>
            <ul>
              <li><button onClick={() => setActiveView('movies')}>Movies</button></li>
              <li><button onClick={() => setActiveView('tvShows')}>TV Shows</button></li>
              <li><button onClick={() => setActiveView('documentaries')}>Documentaries</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><button>Terms of Service</button></li>
              <li><button>Privacy Policy</button></li>
              <li><button>Cookie Policy</button></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Help</h4>
            <ul>
              <li><button>FAQ</button></li>
              <li><button>Contact Support</button></li>
              <li><button>Community</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} StreamFlex. All rights reserved.
        </div>
        <div className="footer-attribution">
          <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB Logo" className="tmdb-logo" />
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
