/**
 * Check if a URL is a LinkedIn job URL
 * Handles various formats:
 * - https://www.linkedin.com/jobs/view/4259182341/
 * - www.linkedin.com/jobs/view/4259182341/
 * - linkedin.com/jobs/view/4259182341/
 * - http://linkedin.com/jobs/view/4259182341/
 */
export const isLinkedInJobUrl = (url) => {
  if (!url) return false;
  const normalizedUrl = url.toLowerCase().trim();
  return normalizedUrl.includes('linkedin.com/jobs/view/');
};

/**
 * Extract LinkedIn job ID from URL
 * Works with or without protocol (http/https) and with or without www
 */
export const extractLinkedInJobId = (url) => {
  if (!url) return null;
  const match = url.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : null;
};
