// Gamification system utilities

export const LEVELS = {
  NOVICE_TRADER: {
    id: 1,
    name: 'Novice Trader',
    emoji: '🥉',
    minSwaps: 0,
    maxSwaps: 2,
    borderClass: 'level-1-border',
    iconPath: '/icons/level-1.svg',
    title: 'Novice Trader'
  },
  APPRENTICE_SWAPPER: {
    id: 2,
    name: 'Apprentice Swapper',
    emoji: '🥈',
    minSwaps: 3,
    maxSwaps: 10,
    borderClass: 'level-2-border',
    iconPath: '/icons/level-2.svg',
    title: 'Apprentice Swapper'
  },
  SKILLED_BARTERER: {
    id: 3,
    name: 'Skilled Barterer',
    emoji: '🥇',
    minSwaps: 11,
    maxSwaps: 25,
    borderClass: 'level-3-border',
    iconPath: '/icons/level-3.svg',
    title: 'Skilled Barterer'
  },
  ELITE_NEGOTIATOR: {
    id: 4,
    name: 'Elite Negotiator',
    emoji: '🏅',
    minSwaps: 26,
    maxSwaps: 50,
    borderClass: 'level-4-border',
    iconPath: '/icons/level-4.svg',
    sparklePath: '/icons/sparkle.svg',
    title: 'Elite Negotiator'
  },
  MASTER_OF_EXCHANGE: {
    id: 5,
    name: 'Master of Exchange',
    emoji: '👑',
    minSwaps: 51,
    maxSwaps: Infinity,
    borderClass: 'level-5-border',
    iconPath: '/icons/level-5.svg',
    title: 'Master of Exchange'
  }
};

export const getCurrentLevel = (swaps) => {
  const swapCount = typeof swaps === 'number' ? swaps : 0;
  
  for (const level of Object.values(LEVELS)) {
    if (swapCount >= level.minSwaps && swapCount <= level.maxSwaps) {
      return level;
    }
  }
  
  return LEVELS.NOVICE_TRADER;
};

export const getNextLevel = (currentLevel) => {
  const levelIds = Object.values(LEVELS).map(level => level.id);
  const nextLevelId = currentLevel.id + 1;
  
  if (nextLevelId <= Math.max(...levelIds)) {
    return Object.values(LEVELS).find(level => level.id === nextLevelId);
  }
  
  return null;
};

export const getProgressToNextLevel = (swaps) => {
  const currentLevel = getCurrentLevel(swaps);
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return 100; // Max level reached
  }
  
  const swapsInCurrentLevel = swaps - currentLevel.minSwaps;
  const swapsNeededForNextLevel = nextLevel.minSwaps - currentLevel.minSwaps;
  
  return Math.min(100, Math.max(0, (swapsInCurrentLevel / swapsNeededForNextLevel) * 100));
};

export const getSwapsNeededForNextLevel = (swaps) => {
  const currentLevel = getCurrentLevel(swaps);
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return 0; // Max level reached
  }
  
  return nextLevel.minSwaps - swaps;
};

export const getLevelTooltipText = (swaps) => {
  const currentLevel = getCurrentLevel(swaps);
  const nextLevel = getNextLevel(currentLevel);
  const swapsNeeded = getSwapsNeededForNextLevel(swaps);
  
  let tooltipText = `Levels are earned by completing swaps:\n`;
  
  Object.values(LEVELS).forEach(level => {
    const range = level.maxSwaps === Infinity 
      ? `${level.minSwaps}+ swaps`
      : `${level.minSwaps}–${level.maxSwaps} swaps`;
    tooltipText += `${level.emoji} ${level.name} – ${range}\n`;
  });
  
  if (nextLevel) {
    tooltipText += `\nYou need ${swapsNeeded} more swap${swapsNeeded !== 1 ? 's' : ''} to reach the next level.`;
  } else {
    tooltipText += `\nYou've reached the maximum level!`;
  }
  
  return tooltipText;
}; 