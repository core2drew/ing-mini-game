import { PlayerStatus, PlayerStatusLabel } from '@models/quiz/player.model';

export const getAvatarColorByName = (name: string | null) => {
  const defaultColor = '#3b82f6'; // Fallback Electric Blue
  const alphabetAvatarColors: Record<string, string> = {
    A: '#ec4899', // Hot Pink
    B: '#3b82f6', // Electric Blue
    C: '#10b981', // Crisp Emerald
    D: '#f59e0b', // Glowing Amber
    E: '#8b5cf6', // Vivid Purple
    F: '#f97316', // Safety Orange
    G: '#06b6d4', // Bright Cyan
    H: '#f43f5e', // Radiant Rose
    I: '#84cc16', // Vibrant Lime
    J: '#6366f1', // Indigo
    K: '#14b8a6', // Fresh Teal
    L: '#a855f7', // Radiant Violet
    M: '#ff6b6b', // Coral Red
    N: '#22c55e', // Neon Green
    O: '#e11d48', // Crimson Accent
    P: '#0284c7', // Sky Sky Blue
    Q: '#d946ef', // Fuchsia
    R: '#4f46e5', // Deep Royal Indigo
    S: '#059669', // Dark Emerald
    T: '#ea580c', // Burnt Orange
    U: '#9333ea', // Deep Purple
    V: '#0891b2', // Deep Cyan
    W: '#c026d3', // Deep Magenta
    X: '#475569', // Medium Slate (Cool Neutrals)
    Y: '#64748b', // Light Slate
    Z: '#0d9488', // Deep Teal
  };

  if (!name || typeof name !== 'string') return defaultColor;

  // Grab the very first letter and capitalize it
  const firstLetter = name.trim().charAt(0).toUpperCase();

  // If it's a valid A-Z letter, return its dedicated color
  if (alphabetAvatarColors[firstLetter]) {
    return alphabetAvatarColors[firstLetter];
  }

  // Fallback for numbers or symbols: use a consistent fallback index via charCode
  const keys = Object.keys(alphabetAvatarColors);
  const fallbackIndex = firstLetter.charCodeAt(0) % keys.length;
  return alphabetAvatarColors[keys[fallbackIndex]];
};

export const getPlayerStatusLabel = (status: PlayerStatus): string => {
  return PlayerStatusLabel[status];
};

export const getPlayerStatusStyleClass = (status: PlayerStatus | undefined) => {
  if (status) {
    return {
      waiting: status === PlayerStatus.WAITING,
      thinking: status === PlayerStatus.THINKING,
      answered: status === PlayerStatus.ANSWERED,
      offline: status === PlayerStatus.OFFLINE,
    };
  }
  return {
    unknown: true,
  };
};
