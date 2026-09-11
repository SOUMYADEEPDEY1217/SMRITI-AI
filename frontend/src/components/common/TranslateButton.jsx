import React, { useState } from 'react';
import { translateText } from '../../data/api';

/**
 * Reusable translate-on-demand button.
 * Props:
 *   text - The text to translate
 *   targetLang - Target language name (e.g. 'Hindi', 'Bengali', 'Gujarati')
 *   size - 'small' | 'normal'
 */
export default function TranslateButton({ text, targetLang = 'Hindi', size = 'small' }) {
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  async function handleTranslate() {
    if (!text || !text.trim()) return;

    if (showPopover) {
      setShowPopover(false);
      return;
    }

    setLoading(true);
    const result = await translateText(text, targetLang);
    setTranslated(result.translated_text || text);
    setShowPopover(true);
    setLoading(false);
  }

  return (
    <span className="translate-btn-wrapper">
      <button
        onClick={handleTranslate}
        className={`translate-btn ${size === 'small' ? 'btn-small' : ''}`}
        title={`Translate to ${targetLang}`}
        aria-label={`Translate to ${targetLang}`}
      >
        {loading ? (
          <span className="spinner" style={{ width: 14, height: 14 }} />
        ) : (
          '🌐'
        )}
      </button>
      {showPopover && translated && (
        <div className="translate-popover">
          <div className="translate-popover-header">
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{targetLang}</span>
            <button onClick={() => setShowPopover(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          <p className="translate-popover-text">{translated}</p>
        </div>
      )}
    </span>
  );
}
