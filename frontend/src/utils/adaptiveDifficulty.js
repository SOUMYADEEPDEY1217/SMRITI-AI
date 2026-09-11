// SMRITI Adaptive Difficulty Engine
// Strictly JavaScript based without machine learning or external algorithms.

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

/**
 * Evaluates new difficulty according to strict performance rules:
 * - Score below 50%  -> Decrease difficulty
 * - Score 50% - 79%  -> Keep the same difficulty
 * - Score 80% and above -> Increase difficulty
 *
 * @param {string} currentDifficulty - 'Easy', 'Medium', or 'Hard'
 * @param {number} score - Percentage score (0 - 100)
 * @returns {object} { newDifficulty, change, message }
 */
export function evaluateAdaptiveDifficulty(currentDifficulty = 'Medium', score = 0) {
  const normCurrent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1).toLowerCase();
  let currentIndex = DIFFICULTY_LEVELS.indexOf(normCurrent);
  if (currentIndex === -1) currentIndex = 1; // Default to Medium

  let newIndex = currentIndex;
  let change = 'same';
  let message = 'Optimal comfort level maintained. Keeping current pace.';

  if (score < 50) {
    // Decrease difficulty
    if (currentIndex > 0) {
      newIndex = currentIndex - 1;
      change = 'decreased';
      message = 'Adjusted to a gentler pace with more guidance to support your comfort.';
    } else {
      change = 'same';
      message = 'Continuing at gentle pace with extra visual hints.';
    }
  } else if (score >= 80) {
    // Increase difficulty
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newIndex = currentIndex + 1;
      change = 'increased';
      message = 'Splendid cognitive mastery! Advancing to a more stimulating challenge.';
    } else {
      change = 'same';
      message = 'Outstanding! You are performing at peak mastery at the highest level.';
    }
  } else {
    // 50% to 79%: Keep same difficulty
    change = 'same';
    message = 'Steady, balanced recall performance. Maintaining current difficulty.';
  }

  return {
    previousDifficulty: DIFFICULTY_LEVELS[currentIndex],
    newDifficulty: DIFFICULTY_LEVELS[newIndex],
    change, // 'decreased' | 'same' | 'increased'
    message
  };
}
