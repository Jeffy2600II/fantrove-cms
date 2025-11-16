import { useState } from 'react';
export function usePagination(initial = 1) {
  const [page, setPage] = useState(initial);
  const next = () => setPage(p => p + 1);
  const prev = () => setPage(p => Math.max(1, p - 1));
  return { page, setPage, next, prev };
}