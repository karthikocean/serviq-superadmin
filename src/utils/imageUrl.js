import { server, IMAGE_BASE_URL } from '../config/index.js';

export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blob URLs, or absolute URLs
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Handle relative paths
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (cleanPath.startsWith('/public')) {
    return `${server}${cleanPath}`;
  }
  return `${IMAGE_BASE_URL ? IMAGE_BASE_URL.replace(/\/public$/, '') : server}${cleanPath}`;
};

export default getImageUrl;
