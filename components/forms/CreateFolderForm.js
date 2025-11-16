'use client';
import React, { useState } from 'react';
import { apiPost } from '../../lib/api';

export default function CreateFolderForm({ onCreated }) {
  const [path, setPath] = useState('');
  const create = async () => {
    try {
      await apiPost('/api/folders', { path });
      setPath('');
      if (onCreated) onCreated();
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <div className="card">
      <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="path/to/folder" className="w-full p-2 border rounded mb-2" />
      <button onClick={create} className="px-3 py-2 bg-green-500 text-white rounded">Create Folder</button>
    </div>
  );
}