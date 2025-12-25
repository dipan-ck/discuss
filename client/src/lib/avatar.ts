// Avatar color utilities
"use client"
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-orange-500',
];

/**
 * Generate a random avatar color
 */
export function generateAvatarColor(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[randomIndex];
}

/**
 * Get avatar color from localStorage or generate a new one
 */
export function getOrCreateAvatarColor(userId: string): string {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return 'bg-gray-500'; // Default color for SSR
  }
  
  const storageKey = `avatar-color-${userId}`;
  
  // Try to get from localStorage
  const storedColor = localStorage.getItem(storageKey);
  
  if (storedColor && AVATAR_COLORS.includes(storedColor)) {
    return storedColor;
  }
  
  // Generate new color and store it
  const newColor = generateAvatarColor();
  localStorage.setItem(storageKey, newColor);
  
  return newColor;
}

/**
 * Get avatar color for a user (from their profile or generate consistent one)
 */
export function getAvatarColor(userId: string, profileColor?: string): string {
  // If user has a profile color, use it
  if (profileColor && AVATAR_COLORS.includes(profileColor)) {
    return profileColor;
  }
  
  // Otherwise get or create from localStorage
  return getOrCreateAvatarColor(userId);
}

/**
 * Get user initials from username
 */
export function getUserInitials(username: string): string {
  if (!username) return 'U';
  return username.slice(0, 2).toUpperCase();
}
