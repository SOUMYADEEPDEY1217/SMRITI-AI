import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/src/vanta.fog';

window.THREE = THREE;

export default function Background3D() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0xef7b7b, // Warm coral pink
          midtoneColor: 0xf9c87c,   // Golden sunset yellow
          lowlightColor: 0xe68873,  // Deep warm orange
          baseColor: 0xfff2e6,      // Soft cream/peach base
          blurFactor: 0.6,
          speed: 1.0,
          zoom: 1.0
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none' // Ensures background doesn't block clicks
      }}
    />
  );
}
