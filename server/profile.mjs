import { isSupportedCity } from '../src/cities.js';
import { interests as allowedInterests, maxInterests } from '../src/interests.js';
export const avatars = ['pink', 'lavender', 'peach', 'teal'];
export function validateProfile(value) {
  if (!value || typeof value.displayName !== 'string' || typeof value.city !== 'string' || !avatars.includes(value.avatar)) return null;
  const displayName = value.displayName.trim();
  if (!displayName || displayName.length > 80 || /[\u0000-\u001f\u007f]/.test(displayName) || !isSupportedCity(value.city)) return null;
  const selected = value.interests === undefined ? [] : value.interests;
  if (!Array.isArray(selected) || selected.length > maxInterests || new Set(selected).size !== selected.length || selected.some(item => typeof item !== 'string' || !allowedInterests.includes(item))) return null;
  return { displayName, city: value.city, avatar: value.avatar, interests: selected };
}
export function profileComplete(user) { return Boolean(user?.displayName?.trim() && isSupportedCity(user.city)); }
export function publicProfile(user) {
  return { email: user.email, displayName: user.displayName || '', city: user.city || '', avatar: avatars.includes(user.avatar) ? user.avatar : 'pink', interests: Array.isArray(user.interests) ? user.interests.filter(item => allowedInterests.includes(item)).slice(0, maxInterests) : [], profileComplete: profileComplete(user) };
}
