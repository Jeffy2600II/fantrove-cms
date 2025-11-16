// Utilities for editor: debounce, detect language, formatting helpers
export function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function detectLanguageFromPath(path = '') {
  if (!path) return null;
  const ext = path.split('.').pop().toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'javascript';
  if (['json'].includes(ext)) return 'json';
  if (['md', 'markdown'].includes(ext)) return 'markdown';
  return 'plain';
}

export function formatContent(content = '', lang = null) {
  try {
    if (!lang) return content;
    if (lang === 'json') {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return JSON.stringify(parsed, null, 2);
    }
    // Very basic JS formatting fallback — keep minimal (avoid heavy formatter libs)
    if (lang === 'javascript') {
      // naive spacing fixes — do not replace real formatters
      return content.replace(/\t/g, '  ');
    }
    // markdown, plain -> return as-is
    return content;
  } catch (e) {
    // If parsing fails, return original (do not break)
    return content;
  }
}