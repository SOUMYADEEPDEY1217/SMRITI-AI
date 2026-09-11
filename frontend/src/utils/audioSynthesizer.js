// SMRITI Audio Utility & Offline Melody Synthesizer
// Generates soothing nostalgic melodies as standard WAV Blobs for HTML5 <audio> playback.

function createWavBlob(sampleRate, samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count (1 = mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generates nostalgic bamboo flute and tanpura notes
export function generateMelodyTrack(type = 'flute', durationSeconds = 12) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const samples = new Float32Array(numSamples);

  // Frequencies for classical Raag Bhupali (pentatonic: Sa, Re, Ga, Pa, Dha)
  // C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00, C5 = 523.25
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, 293.66];
  const noteDuration = durationSeconds / notes.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t / noteDuration));
    const freq = notes[noteIdx];
    const noteTime = t % noteDuration;

    // Envelope (smooth attack and release)
    const attack = Math.min(1, noteTime / 0.15);
    const release = Math.max(0, 1 - (noteTime / noteDuration));
    const env = attack * release;

    // Rich harmonic overtones reminiscent of flute and tanpura drone
    let val = 0;
    if (type === 'flute') {
      // Soft flute harmonics with gentle vibrato
      const vibrato = Math.sin(2 * Math.PI * 5 * t) * 2;
      val = Math.sin(2 * Math.PI * (freq + vibrato) * t) * 0.6 +
            Math.sin(2 * Math.PI * (freq * 2) * t) * 0.2 +
            Math.sin(2 * Math.PI * (freq * 3) * t) * 0.08;
    } else {
      // Warm vintage music box / chimes
      val = Math.sin(2 * Math.PI * freq * t) * 0.5 +
            Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.25 * Math.exp(-noteTime * 2);
    }

    // Gentle baseline tanpura drone (fundamental C3 at 130.81 Hz)
    const drone = Math.sin(2 * Math.PI * 130.81 * t) * 0.08 +
                  Math.sin(2 * Math.PI * 196.00 * t) * 0.05;

    samples[i] = (val * env * 0.6) + drone;
  }

  const blob = createWavBlob(sampleRate, samples);
  return URL.createObjectURL(blob);
}

// Memory cache for synthesized tracks to avoid recomputing
const audioCache = {};

export function getAudioTrackUrl(trackId = 'audio-1') {
  if (audioCache[trackId]) return audioCache[trackId];

  let url;
  if (trackId === 'audio-1') {
    url = generateMelodyTrack('flute', 14);
  } else if (trackId === 'audio-2') {
    url = generateMelodyTrack('chime', 12);
  } else {
    url = generateMelodyTrack('flute', 10);
  }

  audioCache[trackId] = url;
  return url;
}
