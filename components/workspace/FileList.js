'use client';
import React from 'react';
import { useFileStore } from '../../lib/store';
import { useFileManager } from '../../hooks/useFileManager';
import Loading from '../ui/Loading';
import EmptyState from '../ui/EmptyState';
import { formatSize } from '../../lib/formatter';

export default function FileList() {
  const files = useFileStore(s => s.files);
  const isLoading = useFileStore(s => s.isLoading);
  const setOpenFile = useFileStore(s => s.setOpenFile);
  const setEditorContent = useFileStore(s => s.setEditorContent);
  const setEditorSha = useFileStore(s => s.setEditorSha);
  const { readFile, fetchFiles, removeFile } = useFileManager();
  const currentPath = useFileStore(s => s.currentPath);
  
  const open = async (path) => {
    const data = await readFile(path);
    setOpenFile(data.path);
    setEditorContent(data.content);
    setEditorSha(data.sha);
  };
  
  const del = async (path, sha) => {
    if (!confirm('Confirm delete?')) return;
    await removeFile({ path, sha });
    fetchFiles(currentPath);
  };
  
  if (isLoading) return <Loading />;
  
  if (!files || files.length === 0) return <EmptyState title="Empty folder" message="No files or folders found." />;
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Files</h3>
      </div>
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
    </div>
  );
}