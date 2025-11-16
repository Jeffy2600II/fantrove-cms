import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import Fuse from 'fuse.js';

export default function FileTree({ onOpen }) {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [fuse, setFuse] = useState(null);
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchList();
  }, [path]);
  
  useEffect(() => {
    if (!items || items.length === 0) return;
    const f = new Fuse(items, { keys: ['name', 'path'], threshold: 0.3 });
    setFuse(f);
  }, [items]);
  
  useEffect(() => {
    if (!fuse || !query) {
      setResults([]);
      return;
    }
    const r = fuse.search(query).map(({ item }) => item);
    setResults(r);
  }, [query, fuse]);
  
  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/github/list?path=${path}`);
      setItems(data);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
    setLoading(false);
  };
  
  const open = (item) => {
    if (item.type === 'dir') {
      setPath(item.path);
    } else {
      onOpen(item.path);
    }
  };
  
  const goUp = () => {
    if (!path) return;
    const parts = path.split('/');
    parts.pop();
    setPath(parts.join('/'));
  };
  
  const view = query ? results : items;
  
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex gap-2 items-center mb-2">
        <button onClick={goUp} className="px-2 py-1 bg-gray-200 rounded">⬅︎</button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาไฟล์/โฟลเดอร์"
          className="flex-1 p-2 border rounded"
        />
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      <ul className="mt-2 space-y-1 text-sm">
        {view.map((item) => (
          <li key={item.path} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
            <button onClick={() => open(item)} className="text-left flex-1">
              {item.type === 'dir' ? '📁' : '📄'} {item.name}
            </button>
            <div className="text-xs text-gray-400">{item.type}</div>
          </li>
        ))}
        {!loading && view.length === 0 && <li className="text-gray-400">ไม่มีไฟล์</li>}
      </ul>
    </div>
  );
}