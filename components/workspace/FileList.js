'use client';
import React from 'react';
import { useFileStore } from '../../lib/store';
import { useFileManager } from '../../hooks/useFileManager';
import Loading from '../ui/Loading';
import EmptyState from '../ui/EmptyState';
import { formatSize } from '../../lib/formatter';

export default function FileList() {
  const files = useFileStore(s => s.files);
  const isLoading = useFileStore(s => s.isLoading); // true ขณะ fetch แต่ **อย่า setFiles([]) ตอนนี้**
  const setOpenFile = useFileStore(s => s.setOpenFile);
  const setEditorContent = useFileStore(s => s.setEditorContent);
  const setEditorSha = useFileStore(s => s.setEditorSha);
  const { readFile, fetchFiles, removeFile } = useFileManager();
  const currentPath = useFileStore(s => s.currentPath);
  
  // ...
  // ... (ของเดิมไม่มีการเปลี่ยนแปลงตรงนี้)
  // ...
  
  // 👉 *ส่วนที่แก้ไข* — เปลี่ยน UI เฉพาะระหว่าง loading, **แต่อย่า clear รายชื่อไฟล์**
  return (
    <div className="card relative">
      {/* Loading overlay (แต่โชว์ไฟล์แช่ค้างไว้) */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <Loading text="Loading files..." />
        </div>
      )}

      <div className={isLoading ? 'opacity-60 pointer-events-none' : ''}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Files</h3>
        </div>
        {(!files || files.length === 0) && !isLoading ? (
          <EmptyState title="Empty folder" message="No files or folders found." />
        ) : (
          <ul>
            {files.map(f => (
              <li key={f.sha} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{f.type === 'dir' ? '📁' : '📄'}</div>
                  <div>
                    <div className="font-medium">
                      {f.type === 'dir' ? f.name : <button onClick={() => open(f.path)} className="text-left text-blue-600">{f.name}</button>}
                    </div>
                    <div className="text-xs text-gray-400">{f.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">{formatSize(f.size)}</div>
                  {f.type !== 'dir' && <button onClick={() => del(f.path, f.sha)} className="text-red-600">Delete</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}