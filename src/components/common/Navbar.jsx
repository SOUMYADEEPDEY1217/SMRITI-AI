import React, { useState, useEffect } from 'react';
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
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 = std, 1 = large, 2 = xl

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
    setCurrentLang(getSelectedLanguage());
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setCurrentLang(langId);
    // Reload if needed or let components react to localStorage
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
  const t = getTranslation(currentLang);

  return (
    <header className="smriti-navbar" role="banner">
      <div className="container-wide">
        <div className="navbar-inner">
          {/* Brand */}
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
              <div className="brand-sub">Memory & Wellness</div>
            </div>
          </Link>

          {/* Center Navigation based on Role */}
          <nav aria-label="Portal Navigation">
            {role === 'patient' && (
              <ul className="nav-menu-links">
                <li>
                  <Link to="/patient" className={`nav-link ${location.pathname === '/patient' ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/patient/fingerprint" className={`nav-link ${location.pathname === '/patient/fingerprint' ? 'active' : ''}`}>
                    Cognitive Fingerprint
                  </Link>
                </li>
              </ul>
            )}

            {(role === 'doctor' || role === 'nurse') && (
              <ul className="nav-menu-links">
                <li>
                  <Link to="/doctor" className="nav-link active">
                    Patients Roster
                  </Link>
                </li>
              </ul>
            )}

            {role === 'admin' && (
              <ul className="nav-menu-links">
                <li>
                  <Link to="/admin" className="nav-link active">
                    Management Console
                  </Link>
                </li>
              </ul>
            )}
          </nav>

          {/* Actions: Accessibility, Language, User Badge, Logout */}
          <div className="nav-actions-group">
            {/* Language Selector for Patient */}
            {role === 'patient' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--color-bg-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <Icon name="language" size={16} color="var(--color-primary)" />
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    style={{
                      border: 'none',
                      background: currentLang === lang.id ? 'var(--color-primary)' : 'transparent',
                      color: currentLang === lang.id ? '#ffffff' : 'var(--color-text-body)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title={lang.label}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            )}

            {/* Accessibility Zoom */}
            <button
              onClick={cycleFontSize}
              className="btn btn-secondary btn-small"
              title="Adjust text sizing"
              aria-label="Adjust font size"
            >
              Text: {fontSizeLevel === 0 ? 'Standard' : fontSizeLevel === 1 ? 'Large' : 'XL'}
            </button>

            {/* Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className="btn btn-secondary btn-small"
              title="Toggle high contrast"
              aria-label="Toggle high contrast"
            >
              {isHighContrast ? 'Normal Contrast' : 'High Contrast'}
            </button>

            {/* User Role Badge */}
            {currentUser && (
              <span className={`badge badge-${role === 'patient' ? 'easy' : role === 'admin' ? 'hard' : 'all'}`}>
                {role === 'doctor' || role === 'nurse' ? 'Care Team' : role}
              </span>
            )}

            {/* Proper Logout Button */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-small"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)' }}
                title="Log out of current session"
              >
                <Icon name="logout" size={16} color="var(--color-danger)" />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-small">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
