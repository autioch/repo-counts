const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

/* Untrusted text (repo names, file extensions) must go through this before it enters HTML. */
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

/* RFC 4180 quoting: every field wrapped in quotes, inner quotes doubled. Delimiters and newlines inside stay data. */
export const quoteCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
