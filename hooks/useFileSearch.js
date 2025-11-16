import { useState, useEffect } from 'react';
import { apiPost } from '../lib/api';

export function useFileSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await apiPost('/api/files/search', { q: query });
        setResults(res);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);
  
  return { query, setQuery, results, loading };
}