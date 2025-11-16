import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    function onKey(e) {
      const key = [];
      if (e.ctrlKey || e.metaKey) key.push('mod');
      if (e.shiftKey) key.push('shift');
      key.push(e.key.toLowerCase());
      const k = key.join('+');
      if (shortcuts[k]) {
        e.preventDefault();
        shortcuts[k]();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcuts]);
}