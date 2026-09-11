import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icons';
import { logoutUser } from '../../data/api';
import { getCurrentUser, getSelectedLanguage, setSelectedLanguage } from '../../data/storage';
import { SUPPORTED_LANGUAGES, getTranslation } from '../../data/translations';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [currentLang, setCurrentLang] = useState(getSelectedLanguage());
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
    setCurrentLang(getSelectedLanguage());
  }, [location]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setCurrentLang(langId);
    window.dispatchEvent(new Event('languageChange'));
  };

  const toggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const cycleFontSize = () => {
    const next = (fontSizeLevel + 1) % 3;
    setFontSizeLevel(next);
    if (next === 0) {
      document.documentElement.style.fontSize = '15px';
    } else if (next === 1) {
      document.documentElement.style.fontSize = '16px';
    } else {
      document.documentElement.style.fontSize = '18px';
    }
  };

  const role = currentUser?.role || 'guest';

  return (
    <header className="smriti-navbar glass-panel" role="banner">
      <div className="container-wide">
        <div className="navbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Left: Brand */}
          <Link
            to={role === 'patient' ? '/patient' : role === 'doctor' || role === 'nurse' ? '/doctor' : role === 'admin' ? '/admin' : '/'}
            className="brand-wrapper"
            aria-label="Cognitive Care Home"
          >
            <div className="brand-logo-mark">
              <Icon name="heart" size={20} color="#ffffff" />
            </div>
            <div>
              <div className="brand-name">Cognitive Care</div>
            </div>
          </Link>

          {/* Right: Actions */}
          <div className="nav-actions-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            
            {/* Always show Home button for authenticated users */}
            {currentUser && (
              <Link 
                to={role === 'patient' ? '/patient' : role === 'doctor' || role === 'nurse' ? '/doctor' : '/admin'} 
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', background: 'var(--color-bg-surface-elevated)' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🏠</span>
                <span>Home</span>
              </Link>
            )}

            {/* Simplified Settings Dropdown */}
            {currentUser ? (
              <div className="settings-dropdown-wrapper" ref={settingsRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', background: 'var(--color-bg-surface-elevated)' }}
                  aria-label="Settings"
                >
                  <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                  <span>Settings</span>
                </button>

                {showSettings && (
                  <div className="settings-dropdown-menu glass-panel" style={{ 
                    position: 'absolute', top: '120%', right: 0, width: '280px', 
                    padding: '1.25rem', borderRadius: 'var(--radius-lg)', 
                    boxShadow: 'var(--shadow-dropdown)', border: '1px solid var(--color-border)',
                    zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1.25rem',
                    animation: 'fadeInUp 0.2s ease'
                  }}>
                    
                    <div>
                      <div className="settings-label" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-title)' }}>Language</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => handleLanguageChange(lang.id)}
                            className={`btn btn-small ${currentLang === lang.id ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '0.5rem' }}
                          >
                            {lang.nativeName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="settings-label" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-title)' }}>Text Size</div>
                      <button onClick={cycleFontSize} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        {fontSizeLevel === 0 ? 'Standard' : fontSizeLevel === 1 ? 'Large' : 'Extra Large'}
                      </button>
                    </div>

                    <div>
                      <div className="settings-label" style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-title)' }}>Visibility</div>
                      <button onClick={toggleHighContrast} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        {isHighContrast ? 'Normal Colors' : 'High Contrast'}
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.1rem' }}>🚪</span> Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
