// Profile image utility functions

const AVATAR_COLORS = ['#A3D8F4', '#F7CAC9', '#92A8D1', '#F6E2B3', '#B5EAD7', '#FFB7B2', '#B2B7FF', '#B5B2FF'];

/**
 * Get the first letter of a name for avatar fallback
 */
export function getInitial(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Generate a consistent color based on name for avatar fallback
 */
export function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Generate a random color for avatar fallback
 */
export function generateRandomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Get fallback avatar color: user-specific saved color first, then deterministic name color
 */
export function getAvatarFallbackColor(user) {
  if (user?.avatarColor && typeof user.avatarColor === 'string' && user.avatarColor.trim()) {
    return user.avatarColor;
  }
  return getColorFromName(getUserDisplayName(user));
}

/**
 * Get the appropriate profile image URL or null if no image should be shown
 * Priority: 1. User uploaded photo (photoURL), 2. Google photo (if user came from Google), 3. null (show fallback)
 */
export function getProfileImageUrl(user) {
  if (!user) return null;
  
  // If user has uploaded a photo, use it
  if (user.photoURL && user.photoURL.startsWith('https://firebasestorage.googleapis.com/')) {
    return user.photoURL;
  }
  
  // If user has a profilePic (legacy field), use it
  if (user.profilePic) {
    return user.profilePic;
  }
  
  // If user came from Google and has a Google photo, use it (unless they uploaded a custom photo)
  if (user.photoURL && user.photoURL.includes('googleusercontent.com')) {
    return user.photoURL;
  }
  
  // No image available, return null to show fallback
  return null;
}

/**
 * Check if user should show a profile image or fallback
 */
export function shouldShowProfileImage(user) {
  return !!getProfileImageUrl(user);
}

/**
 * Get user display name
 */
export function getUserDisplayName(user) {
  return user?.name || user?.displayName || 'No Name';
} 