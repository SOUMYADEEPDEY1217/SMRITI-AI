import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icons';
import RadarFingerprint from '../../components/charts/RadarFingerprint';
import TrendLineChart from '../../components/charts/TrendLineChart';
import { getActivities, getSelectedLanguage, setSelectedLanguage } from '../../data/storage';
import { SUPPORTED_LANGUAGES, getTranslation } from '../../data/translations';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [currentLang, setCurrentLang] = useState(getSelectedLanguage());
  const [activePreviewTab, setActivePreviewTab] = useState('activity');
  const [heroFlowerSelected, setHeroFlowerSelected] = useState('lotus');
  const [heroFeedback, setHeroFeedback] = useState('Gentle recognition verified');

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const handleLanguageSelect = (langId) => {
    setSelectedLanguage(langId);
    setCurrentLang(langId);
  };

  const handleHeroSelectFlower = (flowerKey, flowerName) => {
    setHeroFlowerSelected(flowerKey);
    setHeroFeedback(`${flowerName} matched gently`);
  };

  const t = getTranslation(currentLang);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sample data for live interactive preview components
  const sampleRadarData = {
    visualMemory: 88,
    auditoryMemory: 82,
    faceRecognition: 94,
    temporalOrientation: 86,
    sequentialMemory: 80,
    semanticKnowledge: 90,
    delayedRecall: 76,
    patternMatching: 85
  };

  const sampleClinicianSessions = [
    { date: '2026-09-01', score: 78, responseTimeSec: 5.1 },
    { date: '2026-09-03', score: 82, responseTimeSec: 4.8 },
    { date: '2026-09-05', score: 80, responseTimeSec: 4.4 },
    { date: '2026-09-07', score: 88, responseTimeSec: 4.0 },
    { date: '2026-09-09', score: 86, responseTimeSec: 3.8 },
    { date: '2026-09-10', score: 92, responseTimeSec: 3.5 },
    { date: '2026-09-11', score: 90, responseTimeSec: 3.7 }
  ];

  const iconMap = {
    'memory-garden': 'garden',
    'familiar-face': 'face',
    'lifestory': 'story',
    'memory-radio': 'radio',
    'daily-companion': 'companion',
    'memory-walk': 'walk',
    'culture-quest': 'culture',
    'recall-loop': 'loop',
    'family-puzzle': 'puzzle',
    'cognitive-fingerprint': 'fingerprint'
  };

  return (
    <div className="landing-page-frame">
      <div className="landing-canvas-container">
        {/* =============================================================
            1. MINIMAL FLOATING NAVBAR
            ============================================================= */}
        <header className="landing-floating-nav" role="banner">
          <div className="landing-nav-inner">
            <Link to="/" className="brand-minimal-link" aria-label="Cognitive Care Home">
              <span className="brand-accent-dot" aria-hidden="true"></span>
              <span className="brand-minimal-title">Cognitive Care</span>
            </Link>

            <nav aria-label="Main navigation" className="landing-nav-menu">
              <button onClick={() => scrollToSection('how-it-works')} className="landing-nav-item-btn">
                How It Works
              </button>
              <button onClick={() => scrollToSection('activities')} className="landing-nav-item-btn">
                Activities
              </button>
              <button onClick={() => scrollToSection('product-preview')} className="landing-nav-item-btn">
                Preview
              </button>
              <button onClick={() => scrollToSection('care-teams')} className="landing-nav-item-btn">
                Care Teams
              </button>
              <button onClick={() => scrollToSection('language')} className="landing-nav-item-btn">
                Language
              </button>
            </nav>

            <div className="landing-nav-actions">
              <Link to="/login" className="btn-ghost-pill">
                Log In
              </Link>
              <Link to="/login" className="btn-black-pill">
                Get Started
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* =============================================================
            2. EDITORIAL HERO SECTION & OVERLAPPING MOCKUP STAGE
            ============================================================= */}
        <section className="editorial-hero" id="hero">
          <div className="editorial-hero-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              COGNITIVE CARE
            </div>
            <h1 className="hero-editorial-title">
              Memory support that feels <span className="accent-highlight">human.</span>
            </h1>
            <p className="hero-editorial-sub">
              A simple platform for meaningful cognitive activities, personalized engagement and progress tracking.
            </p>
            <div className="hero-editorial-ctas">
              <Link to="/login" className="btn-black-pill">
                Get Started
                <Icon name="arrow-right" size={16} />
              </Link>
              <button onClick={() => scrollToSection('activities')} className="btn-ghost-pill">
                Explore Activities
              </button>
            </div>
          </div>

          {/* Overlapping Hero Product UI Mockups */}
          <div className="hero-mockup-stage">
            {/* Top-Right Floating Card: Cognitive Balance */}
            <div className="floating-ui-card floating-card-top-right">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#f8f6f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c26d38'
                }}
              >
                <Icon name="fingerprint" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                  Cognitive Balance
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                  89% Recall Harmony
                </div>
              </div>
            </div>

            {/* Bottom-Left Floating Card: Adaptive Pacing */}
            <div className="floating-ui-card floating-card-bottom-left">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#f8f6f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2d6a4f'
                }}
              >
                <Icon name="shield-check" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                  Adaptive Pacing
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                  Comfort Mode &bull; Dynamically Tuned
                </div>
              </div>
            </div>

            {/* Central Product Mockup Card: Patient Activity Interface */}
            <div className="main-product-mockup-card">
              <div className="mockup-window-controls">
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 600 }}>
                  Cognitive Care &bull; Daily Memory Oasis &bull; Visual Recall
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c26d38', fontWeight: 800 }}>
                    Exercise 01 of 03
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    Memory Garden: Gentle Floral Sequence
                  </h3>
                </div>
                <span
                  style={{
                    backgroundColor: '#f8f6f0',
                    border: '1px solid #e2dfd7',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                >
                  Unpaced Session
                </span>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#475467', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Select the familiar flower blossom shown in the previous garden display. Take your time without rush.
              </p>

              {/* Interactive Floral Cards inside Mockup */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleHeroSelectFlower('lotus', 'Pink Lotus')}
                  style={{
                    background: heroFlowerSelected === 'lotus' ? '#faf8f5' : '#ffffff',
                    border: heroFlowerSelected === 'lotus' ? '2px solid #0f172a' : '1px solid #e2dfd7',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', margin: '0 auto 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="garden" size={20} color="#b91c1c" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Pink Lotus</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Sacred Blossom</div>
                  {heroFlowerSelected === 'lotus' && (
                    <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c26d38' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleHeroSelectFlower('jasmine', 'White Jasmine')}
                  style={{
                    background: heroFlowerSelected === 'jasmine' ? '#faf8f5' : '#ffffff',
                    border: heroFlowerSelected === 'jasmine' ? '2px solid #0f172a' : '1px solid #e2dfd7',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', margin: '0 auto 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="garden" size={20} color="#3730a3" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>White Jasmine</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Fragrant Petals</div>
                  {heroFlowerSelected === 'jasmine' && (
                    <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c26d38' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleHeroSelectFlower('marigold', 'Golden Marigold')}
                  style={{
                    background: heroFlowerSelected === 'marigold' ? '#faf8f5' : '#ffffff',
                    border: heroFlowerSelected === 'marigold' ? '2px solid #0f172a' : '1px solid #e2dfd7',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', margin: '0 auto 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="garden" size={20} color="#b45309" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Golden Marigold</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Festive Warmth</div>
                  {heroFlowerSelected === 'marigold' && (
                    <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c26d38' }} />
                  )}
                </button>
              </div>

              {/* Bottom Mockup Reassurance Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #f1efe8',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2d6a4f', fontSize: '0.88rem', fontWeight: 700 }}>
                  <Icon name="check" size={16} />
                  <span>{heroFeedback}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>Accuracy: <strong style={{ color: '#0f172a' }}>94%</strong></span>
                  <span>Average Time: <strong style={{ color: '#0f172a' }}>3.8s</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================
            3. "HOW COGNITIVE CARE WORKS" SECTION
            ============================================================= */}
        <section className="editorial-section" id="how-it-works">
          <div className="section-editorial-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              THE JOURNEY
            </div>
            <h2 className="section-editorial-title">
              How Cognitive Care works
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475467', marginTop: '0.85rem', lineHeight: 1.6 }}>
              A structured five-step path designed around gentle repetition, calming sensory cues, and stress-free engagement.
            </p>
          </div>

          <div className="editorial-steps-row">
            <div className="editorial-step-card">
              <div>
                <div className="editorial-step-num">01</div>
                <h3 className="editorial-step-title">Choose an activity</h3>
                <p className="editorial-step-body">
                  Select from 10 gentle exercises rooted in familiar cultural stories, melodious instruments, gardens, and faces.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
                <Icon name="arrow-right" size={16} />
              </div>
            </div>

            <div className="editorial-step-card">
              <div>
                <div className="editorial-step-num">02</div>
                <h3 className="editorial-step-title">Complete the challenge</h3>
                <p className="editorial-step-body">
                  Participate at an unhurried, comfortable pace with high-contrast text, clear tactile buttons, and reassuring prompts.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
                <Icon name="arrow-right" size={16} />
              </div>
            </div>

            <div className="editorial-step-card">
              <div>
                <div className="editorial-step-num">03</div>
                <h3 className="editorial-step-title">See your result</h3>
                <p className="editorial-step-body">
                  Review calm, affirming performance insights that celebrate effort and focus without punishing mistakes.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
                <Icon name="arrow-right" size={16} />
              </div>
            </div>

            <div className="editorial-step-card">
              <div>
                <div className="editorial-step-num">04</div>
                <h3 className="editorial-step-title">Your experience adapts</h3>
                <p className="editorial-step-body">
                  The system softly tunes cues and timing based on recent completion ease, keeping every session dignified and relaxed.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
                <Icon name="arrow-right" size={16} />
              </div>
            </div>

            <div className="editorial-step-card">
              <div>
                <div className="editorial-step-num">05</div>
                <h3 className="editorial-step-title">Track your progress</h3>
                <p className="editorial-step-body">
                  View your holistic Cognitive Fingerprint across key cognitive domains, accessible to you and your healthcare team.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', color: '#c26d38' }}>
                <Icon name="check" size={16} />
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================
            4. ACTIVITIES SECTION: "DESIGNED AROUND MEMORY"
            ============================================================= */}
        <section className="editorial-section" id="activities">
          <div className="section-editorial-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              COGNITIVE DOMAINS
            </div>
            <h2 className="section-editorial-title">
              Designed around memory.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475467', marginTop: '0.85rem', lineHeight: 1.6 }}>
              Ten carefully crafted exercises addressing visual recall, auditory familiarity, personal history, and orientation.
            </p>
          </div>

          <div className="editorial-activities-layout">
            {/* Featured Card 1: Memory Garden */}
            <div className="activity-featured-span-6">
              <div className="editorial-activity-card featured-dark" style={{ minHeight: '340px' }}>
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Icon name="garden" size={22} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c26d38', background: 'rgba(194, 109, 56, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                      Featured &bull; Visual Recall
                    </span>
                  </div>
                  <h3 className="activity-editorial-title">1. Memory Garden</h3>
                  <p className="activity-editorial-desc">
                    A peaceful visual recall exercise presenting colorful flowers and seasonal foliage in an organic outdoor sequence. Enhances pattern retention and spatial attention through gentle observation.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Est. 3-4 mins &bull; Calm pace</span>
                  <Link to="/login" className="activity-editorial-action">
                    <span>Practice Activity</span>
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured Card 2: Memory Radio */}
            <div className="activity-featured-span-6">
              <div className="editorial-activity-card" style={{ minHeight: '340px', background: '#faf8f5' }}>
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Icon name="radio" size={22} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a', background: '#e7e5dc', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                      Featured &bull; Auditory Recall
                    </span>
                  </div>
                  <h3 className="activity-editorial-title">4. Memory Radio</h3>
                  <p className="activity-editorial-desc">
                    Reconnects through soothing melodies, traditional string instruments, and vintage radio tones. Auditory cues awaken nostalgic pathways and temporal recall with gentle rhythm.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e7e5dc', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Est. 4 mins &bull; HTML5 Audio</span>
                  <Link to="/login" className="activity-editorial-action">
                    <span>Tune In & Practice</span>
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Supporting Card: Familiar Face */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="face" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Social</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    2. Familiar Face
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Recognize photos of family members, caregivers, and cherished personal friends.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: LifeStory */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="story" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Narrative</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    3. LifeStory
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Engage with personal milestones, hometown memories, and career reflections.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Daily Companion */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="companion" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Orientation</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    5. Daily Companion
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Interactive morning orientation covering day of week, weather, and gentle routines.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Memory Walk */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="walk" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Spatial</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    6. Memory Walk
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Trace sequential path landmarks through familiar park pathways and neighborhood spots.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Culture Quest */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="culture" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Semantic</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    7. Culture Quest
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Celebrate regional traditions, seasonal sweets, harvest festivals, and folklore.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Recall Loop */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="loop" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Short-Term</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    8. Recall Loop
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Verbal pair matching with a gentle delay interval to strengthen retention.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Family Puzzle */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="puzzle" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Visuospatial</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    9. Family Puzzle
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Tile re-assembly of family photo slices and heartwarming heritage scenes.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>

            {/* Supporting Card: Cognitive Fingerprint */}
            <div className="activity-item-span-3">
              <div className="editorial-activity-card">
                <div>
                  <div className="activity-editorial-header">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="fingerprint" size={20} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Holistic</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    10. Cognitive Fingerprint
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475467', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Comprehensive 8-domain balance mapping showing areas of steady strength.
                  </p>
                </div>
                <Link to="/login" className="activity-editorial-action">
                  <span>Open</span>
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================
            5. PRODUCT PREVIEW SECTION (ACTUAL REACT COMPONENTS + TABS)
            ============================================================= */}
        <section className="editorial-section" id="product-preview">
          <div className="section-editorial-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              AUTHENTIC PRODUCT UI
            </div>
            <h2 className="section-editorial-title">
              Experience the actual interface.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475467', marginTop: '0.85rem', lineHeight: 1.6 }}>
              Inspect the patient activity interface, reassuring post-session feedback, and the multi-axial cognitive radar.
            </p>
          </div>

          <div className="product-preview-shell">
            {/* Tab Controls */}
            <div className="product-preview-nav">
              <button
                type="button"
                className={`preview-tab-btn ${activePreviewTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('activity')}
              >
                Patient Activity Screen
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activePreviewTab === 'result' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('result')}
              >
                Session Result & Feedback
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activePreviewTab === 'radar' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('radar')}
              >
                Cognitive Fingerprint Radar
              </button>
            </div>

            {/* Tab 1: Patient Activity Screen */}
            {activePreviewTab === 'activity' && (
              <div style={{ background: '#ffffff', borderRadius: 20, padding: '2.5rem', border: '1px solid #e7e5dc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1efe8', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c26d38', fontWeight: 800 }}>
                      Activity Preview
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                      LifeStory: Cherished Hometown Memories
                    </h3>
                  </div>
                  <span style={{ background: '#f8f6f0', padding: '0.4rem 0.9rem', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    Comfort Mode Active
                  </span>
                </div>

                <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, marginBottom: '2rem' }}>
                  "Which familiar celebration did you enjoy visiting each autumn with family?"
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ background: '#faf8f5', border: '2px solid #0f172a', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#c26d38' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>The Autumn Harvest Fair</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Lanterns, traditional sweets & folk songs</div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2dfd7', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#e2dfd7' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>The Riverside Boat Regatta</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Gentle breezes along the ghats</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1efe8', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2d6a4f', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Icon name="check" size={16} />
                    <span>Selected response confirmed</span>
                  </div>
                  <Link to="/login" className="btn-black-pill" style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}>
                    Start Full Session
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Session Result Screen */}
            {activePreviewTab === 'result' && (
              <div style={{ background: '#ffffff', borderRadius: 20, padding: '2.5rem', border: '1px solid #e7e5dc' }}>
                <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto 2rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Icon name="check" size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                    Wonderful Session Complete!
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.4rem' }}>
                    You completed the Memory Walk with calm focus and great attention to detail.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#faf8f5', border: '1px solid #e7e5dc', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Accuracy Score</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>92%</div>
                    <div style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '0.2rem', fontWeight: 600 }}>Consistent recall</div>
                  </div>

                  <div style={{ background: '#faf8f5', border: '1px solid #e7e5dc', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Response Time</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>3.8s</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>Unhurried pace</div>
                  </div>

                  <div style={{ background: '#faf8f5', border: '1px solid #e7e5dc', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pacing Level</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c26d38', marginTop: '0.25rem' }}>Comfort 2</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>Optimal balance</div>
                  </div>
                </div>

                <div style={{ background: '#f8f6f0', borderRadius: 14, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475467', fontWeight: 600 }}>
                    Results are saved securely to your personal Cognitive Fingerprint.
                  </span>
                  <Link to="/login" className="btn-black-pill" style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}>
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 3: Live Chart.js Radar */}
            {activePreviewTab === 'radar' && (
              <div style={{ background: '#ffffff', borderRadius: 20, padding: '2rem 2.5rem', border: '1px solid #e7e5dc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1efe8', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Cognitive Fingerprint Visualization
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                      Live 8-domain radar mapping memory domains against the reference baseline.
                    </p>
                  </div>
                  <span style={{ background: '#f8f6f0', padding: '0.35rem 0.85rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    Live Chart.js Component
                  </span>
                </div>

                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                  <RadarFingerprint domainData={sampleRadarData} height={320} title="" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =============================================================
            6. PERSONALIZED EXPERIENCE & ADAPTIVE DIFFICULTY
            ============================================================= */}
        <section className="editorial-section" id="personalization">
          <div className="section-editorial-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              SMART ADAPTATION
            </div>
            <h2 className="section-editorial-title">
              Every session learns from the last.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475467', marginTop: '0.85rem', lineHeight: 1.6 }}>
              The experience adjusts challenge levels based on recent performance. No clinical labels, no discouraging timers—just a gentle experience that preserves dignity.
            </p>
          </div>

          <div className="pacing-editorial-chain">
            <div className="pacing-editorial-node">
              <div className="pacing-node-header">
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c26d38', fontWeight: 800 }}>
                  Stage 01
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c26d38' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Activity
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475467', lineHeight: 1.55 }}>
                Engage in your chosen exercise with rich visual, auditory, and cultural cues.
              </p>
            </div>

            <div className="pacing-editorial-node">
              <div className="pacing-node-header">
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f172a', fontWeight: 800 }}>
                  Stage 02
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0f172a' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Performance
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475467', lineHeight: 1.55 }}>
                Subtle metrics like recall accuracy and reaction tempo are recorded unobtrusively.
              </p>
            </div>

            <div className="pacing-editorial-node">
              <div className="pacing-node-header">
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f172a', fontWeight: 800 }}>
                  Stage 03
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0f172a' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Difficulty
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475467', lineHeight: 1.55 }}>
                When accuracy dips below 50%, extra guidance is supplied; high success advances detail.
              </p>
            </div>

            <div className="pacing-editorial-node">
              <div className="pacing-node-header">
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2d6a4f', fontWeight: 800 }}>
                  Stage 04
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2d6a4f' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Next Challenge
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475467', lineHeight: 1.55 }}>
                Tomorrow's session automatically initializes at your comfortable, calibrated baseline.
              </p>
            </div>
          </div>
        </section>

        {/* =============================================================
            7. LANGUAGE COMFORT SECTION
            ============================================================= */}
        <section className="editorial-section" id="language">
          <div className="section-editorial-header">
            <div className="hero-overline-tag">
              <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
              NATIVE ACCESSIBILITY
            </div>
            <h2 className="section-editorial-title">
              Choose the language that feels natural.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475467', marginTop: '0.85rem', lineHeight: 1.6 }}>
              Language comfort is vital for deep cognitive ease. Select your preference below—it will be remembered across all exercises and sessions.
            </p>
          </div>

          <div className="language-editorial-grid">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`language-editorial-card ${isSelected ? 'selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: isSelected ? '#c26d38' : '#64748b' }}>
                      {lang.label}
                    </span>
                    {isSelected && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={13} color="#ffffff" />
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'inherit', marginBottom: '0.5rem' }}>
                    {lang.nativeName}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#475467', lineHeight: 1.5 }}>
                    {lang.id === 'en' && 'Clean typography and gentle instructions in English.'}
                    {lang.id === 'bn' && 'বাংলা ভাষায় স্নিগ্ধ ও অর্থবহ স্মৃতিচর্চার প্ল্যাটফর্ম।'}
                    {lang.id === 'hi' && 'सहज, सरल और गरिमापूर्ण हिंदी भाषा में स्मृति अभ्यास।'}
                  </p>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #efeee8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#0f172a' : '#94a3b8' }}>
                    <span>{isSelected ? 'Active Preference' : 'Tap to Select'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =============================================================
            8. CARE TEAMS SECTION
            ============================================================= */}
        <section className="editorial-section" id="care-teams">
          <div className="care-team-editorial-layout">
            <div>
              <div className="hero-overline-tag">
                <span className="brand-accent-dot" style={{ width: 7, height: 7 }}></span>
                FOR CLINICIANS & FAMILIES
              </div>
              <h2 className="section-editorial-title" style={{ marginTop: '0.5rem' }}>
                Care teams see the bigger picture.
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#475467', marginTop: '1rem', lineHeight: 1.6 }}>
                Cognitive Care connects peaceful daily home engagement with clinical visibility. Physicians, nurses, and family caregivers can monitor longitudinal trends without adding stress to the patient.
              </p>

              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>Longitudinal Trend Analysis</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Observe accuracy consistency and reaction speeds across weeks of regular practice.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>8-Domain Radar Balance</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Detect subtle domain shifts between visual memory, auditory recall, and orientation.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>Custom Notes & Baseline Calibration</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Physicians can record visit notes and adjust individualized challenge baselines.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <Link to="/login" className="btn-black-pill">
                  Access Clinician Portal
                  <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </div>

            {/* Clinician Roster & Trend UI Preview */}
            <div style={{ background: '#faf8f5', border: '1px solid #e7e5dc', borderRadius: 24, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e7e5dc', paddingBottom: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c26d38', fontWeight: 800 }}>
                    Care Team Dashboard View
                  </span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    Ramesh Patel (72y) &bull; Apollo Geriatric Clinic
                  </h4>
                </div>
                <span style={{ background: '#ffffff', border: '1px solid #e7e5dc', padding: '0.3rem 0.8rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 700, color: '#2d6a4f' }}>
                  Stable Trend
                </span>
              </div>

              <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e7e5dc', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>7-Day Longitudinal Progress</span>
                  <span style={{ fontSize: '0.82rem', color: '#2d6a4f', fontWeight: 700 }}>88% Accuracy Average</span>
                </div>
                <TrendLineChart sessions={sampleClinicianSessions} height={200} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 12, border: '1px solid #e7e5dc' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Visual Memory</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginTop: '0.2rem' }}>88%</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 12, border: '1px solid #e7e5dc' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Face Recall</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginTop: '0.2rem' }}>94%</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 12, border: '1px solid #e7e5dc' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Mean Time</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#c26d38', marginTop: '0.2rem' }}>3.7s</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================
            9. FINAL CTA SECTION
            ============================================================= */}
        <section className="editorial-section" style={{ borderBottom: 'none', paddingBottom: '3rem' }}>
          <div className="final-cta-editorial-card">
            <h2 className="final-cta-editorial-title">
              Start a more meaningful way to support memory.
            </h2>
            <p className="final-cta-editorial-sub">
              Explore Cognitive Care and discover a simpler way to engage with cognitive activities and progress.
            </p>
            <div>
              <Link
                to="/login"
                className="btn-black-pill"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderColor: '#ffffff',
                  padding: '0.9rem 2.2rem',
                  fontSize: '1.05rem'
                }}
              >
                Get Started
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* =============================================================
            10. STRONG BLACK FOOTER
            ============================================================= */}
        <footer className="strong-black-footer" role="contentinfo">
          <div className="footer-columns-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <span className="brand-accent-dot" style={{ backgroundColor: '#c26d38' }}></span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Cognitive Care
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '320px' }}>
                Dignified, culturally meaningful memory activities and objective tracking for individuals, families, and healthcare providers.
              </p>
            </div>

            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links-list">
                <li>
                  <button onClick={() => scrollToSection('activities')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer' }} className="footer-link-item">
                    Activities
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer' }} className="footer-link-item">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('language')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer' }} className="footer-link-item">
                    Language Support
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Care</div>
              <ul className="footer-links-list">
                <li>
                  <Link to="/login" className="footer-link-item">
                    For Patients
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="footer-link-item">
                    For Care Teams
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links-list">
                <li>
                  <span className="footer-link-item" style={{ cursor: 'default' }}>About</span>
                </li>
                <li>
                  <span className="footer-link-item" style={{ cursor: 'default' }}>Contact</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>
              &copy; {new Date().getFullYear()} Cognitive Care. Designed for dignity and cognitive wellness.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Memory Support</span>
              <span>&bull;</span>
              <span>Accessibility</span>
              <span>&bull;</span>
              <span>Family Care</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
