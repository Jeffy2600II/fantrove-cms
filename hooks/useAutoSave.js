import { useEffect, useRef } from 'react';

export function useAutoSave(saveFn, content, interval = 30000) {
  const last = useRef(content);
  
  useEffect(() => {
    const id = setInterval(() => {
      if (last.current !== content) {
        saveFn().catch(() => {});
        last.current = content;
      }
    }, interval);
    return () => clearInterval(id);
  }, [content, saveFn, interval]);
}