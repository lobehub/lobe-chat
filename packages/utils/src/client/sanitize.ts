import DOMPurify from 'dompurify';

/**
 * Sanitizes SVG content to prevent XSS attacks while preserving safe SVG elements and attributes
 * @param content - The SVG content to sanitize
 * @returns Sanitized SVG content safe for rendering
 */
export const sanitizeSVGContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    FORBID_ATTR: [
      'onblur',
      'onchange',
      'onclick',
      'onerror',
      'onfocus',
      'onkeydown',
      'onkeypress',
      'onkeyup',
      'onload',
      'onmousedown',
      'onmouseout',
      'onmouseover',
      'onmouseup',
      'onreset',
      'onselect',
      'onsubmit',
      'onunload',
    ],
    FORBID_TAGS: ['embed', 'link', 'object', 'script', 'style'],
    KEEP_CONTENT: false,
    USE_PROFILES: { svg: true, svgFilters: true },
  });
};

/**
 * Sanitizes Mermaid diagram content to prevent XSS attacks.
 *
 * Mermaid supports HTML labels in certain node syntaxes like `A["<html>"]`.
 * This function strips potentially dangerous HTML content from these labels
 * while preserving the diagram structure.
 *
 * @param content - The Mermaid diagram content to sanitize
 * @returns Sanitized Mermaid content safe for rendering
 */
export const sanitizeMermaidContent = (content: string): string => {
  // Match HTML labels in Mermaid: ["..."], [("...")], etc.
  // These patterns allow HTML rendering in Mermaid when securityLevel is 'loose'
  // We need to sanitize any HTML-like content within them

  // Pattern to match Mermaid HTML label syntaxes:
  // - ["..."] - Standard HTML label
  // - [("...")] - Stadium-shaped with HTML
  // - [["..."]] - Subroutine shape with HTML
  const htmlLabelPattern = /(\[+\(?["'])([\s\S]*?)(["']\)?\]+)/g;

  return content.replaceAll(htmlLabelPattern, (match, prefix, labelContent, suffix) => {
    // Sanitize the label content to remove dangerous HTML
    const sanitized = DOMPurify.sanitize(labelContent, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'em', 'strong', 'sub', 'sup', 'small'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    return `${prefix}${sanitized}${suffix}`;
  });
};
