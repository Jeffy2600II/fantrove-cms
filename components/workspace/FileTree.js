'use client';
import React, { useEffect } from 'react';
import { useFileStore } from '../../lib/store';
import { useFileManager } from '../../hooks/useFileManager';

export default function FileTree() {
  const currentPath = useFileStore(s => s.currentPath);
  const setPath = useFileStore(s => s.setPath);
  const files = useFileStore(s => s.files);
  const { fetchFiles } = useFileManager();
  
  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);
  
  const go = (folder) => {
    const next = currentPath ? `${currentPath}/${folder}` : folder;
    setPath(next);
  };
  
  return (
    <div>
      {files.length === 0 && <div className="text-sm text-gray-400">No files</div>}
      <ul>
        {files.map(f => (
          <li key={f.sha} className="flex items-center justify-between py-1">
            <div>
              {f.type === 'dir' ? '📁' : '📄'}{' '}
              {f.type === 'dir' ? <button onClick={() => go(f.name)} className="text-blue-600">{f.name}</button> : f.name}
            </div>
            <div className="text-xs text-gray-400">{f.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}