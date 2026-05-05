/**
 * Environment variable access with normalization.
 * All frontend code should read env vars through this module.
 */

/**
 * Returns the normalized API base URL.
 * - Removes trailing slash
 * - Ensures the URL ends with /api (backend global prefix)
 * - Never duplicates /api if already present
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gjxpress.net';
  // Remove trailing slash(es)
  let base = raw.replace(/\/+$/, '');
  // Ensure it ends with /api
  if (!base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net';
}
