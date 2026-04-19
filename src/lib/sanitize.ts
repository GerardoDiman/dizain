import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Used for any dynamically rendered content from InsForge CMS.
 *
 * Note: DOMPurify requires a DOM environment.
 * In SSG context, use this only when rendering HTML strings.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    /* Server-side: strip all HTML tags as a safe fallback */
    return dirty.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}
