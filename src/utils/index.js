/**
 * RAGEWARE - Utility Functions
 */

export const formatScore = (num) => {
  return String(num).padStart(3, '0');
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const generateAsciiRageBar = (percent, length = 18) => {
  const filledCount = Math.round((percent / 100) * length);
  const emptyCount = Math.max(0, length - filledCount);
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
};
