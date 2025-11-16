'use client';
import React, { useState } from 'react';
import { apiPost } from '../../lib/api';

export default function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);

  const upload = () => {
    if (!file) return alert('Select file');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        await apiPost('/api/files', { path: path || file.name, content: e.target.result, message: `Upload ${file.name}` });
        setFile(null); setPath('');
        if (onSuccess) onSuccess();
      } catch (err) {
        alert(err.message);
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="card">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-2" />
      <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="destination path (optional)" className="w-full p-2 border rounded mb-2" />
      <button onClick={upload} disabled={loading} className="px-3 py-2 bg-blue-500 text-white rounded">Upload</button>
    </div>
  );
}