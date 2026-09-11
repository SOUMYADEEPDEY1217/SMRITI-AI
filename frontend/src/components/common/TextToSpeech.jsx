import React, { useState, useRef } from 'react';
import { getTTSAudioUrl } from '../../data/api';

/**
 * Reusable Text-to-Speech button component.
 * Props:
 *   text - The text to speak
 *   langCode - Language code (hi, bn, gu, mr, pa, ur) default 'hi'
 *   size - Button size: 'small' | 'normal'
 */
export default function TextToSpeech({ text, langCode = 'hi', size = 'small' }) {
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef(null);

  async function handlePlay() {
    if (!text || !text.trim()) return;

    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setLoadingAudio(true);
    try {
      const url = getTTSAudioUrl(text, langCode);
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = url;
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => { setPlaying(false); setLoadingAudio(false); };
      await audioRef.current.play();
      setPlaying(true);
    } catch (e) {
      console.warn('TTS playback failed:', e);
    }
    setLoadingAudio(false);
  }

  return (
    <button
      onClick={handlePlay}
      className={`tts-btn ${size === 'small' ? 'btn-small' : ''}`}
      title={playing ? 'Stop' : 'Read Aloud'}
      aria-label={playing ? 'Stop reading' : 'Read text aloud'}
    >
      {loadingAudio ? (
        <span className="spinner" style={{ width: 14, height: 14 }} />
      ) : playing ? (
        '⏹️'
      ) : (
        '🔊'
      )}
    </button>
  );
}
