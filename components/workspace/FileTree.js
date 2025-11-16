'use client';
import React from 'react';

export default function FileTree({ files, currentPath, setPath }) {
  // แสดงรายชื่อโฟลเดอร์/ไฟล์, สามารถกดเข้า dir ต่อได้เลย
  const go = (folder) => {
    setPath(currentPath ? `${currentPath}/${folder}` : folder);
  };
  if (!files || files.length === 0) {
    return <div className="text-sm text-gray-400">No files</div>;
  }
  return (
    <ul>
      {files.map(f => (
        <li key={f.sha} className="flex items-center justify-between py-1">
          <div>
            {f.type === 'dir'
              ? <button onClick={() => go(f.name)} className="text-blue-600 hover:underline">
                  📁 {f.name}
                </button>
              : <span>📄 {f.name}</span>
            }
          </div>
          <div className="text-xs text-gray-400">{f.type}</div>
        </li>
      ))}
    </ul>
  );
}