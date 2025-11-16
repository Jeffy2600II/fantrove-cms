'use client';
import React, { useEffect } from 'react';
import FileTree from '../workspace/FileTree';
import { useFileStore } from '../../lib/store';
import { useFileManager } from '../../hooks/useFileManager';

export default function Sidebar() {
  const currentPath = useFileStore(s => s.currentPath);
  const setPath = useFileStore(s => s.setPath);
  const files = useFileStore(s => s.files);
  const { fetchFiles } = useFileManager();
  
  // โหลดไฟล์ใหม่ทุกครั้งที่ path เปลี่ยน
  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);
  
  // Go Back (ย้อนกลับไปโฟลเดอร์ก่อนหน้า)
  function goBack() {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setPath(parts.join('/') || '');
  }
  
  return (
    <aside className="hidden md:block w-64 bg-white border-r p-4 h-screen overflow-y-auto">
      <div className="mb-4 flex flex-col">
        <h2 className="font-semibold mb-1">Workspace</h2>
        <p className="text-xs text-gray-500 truncate">{currentPath || 'Root'}</p>
        {currentPath &&
          <button onClick={goBack} className="mt-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 self-start">
            ⬅️ Go Back
          </button>
        }
      </div>
      <FileTree files={files} currentPath={currentPath} setPath={setPath} />
    </aside>
  );
}