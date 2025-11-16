import { useState, useEffect } from 'react';
export function useContextMenu() {
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, data: null });
  useEffect(() => {
    const close = () => setMenu(m => ({ ...m, visible: false }));
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);
  const open = (x, y, data) => setMenu({ visible: true, x, y, data });
  return { menu, open, close: () => setMenu(m => ({ ...m, visible: false })) };
}