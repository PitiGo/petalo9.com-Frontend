import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML de posts del blog antes de renderizarlo con dangerouslySetInnerHTML.
 * Permite iframes de YouTube y atributos básicos de enlaces/imágenes.
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', {
    ADD_ATTR: ['target', 'rel', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
    ADD_TAGS: ['iframe'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
}
