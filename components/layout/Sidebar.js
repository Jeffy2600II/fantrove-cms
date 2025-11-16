'use client';
import React from 'react';
import FileTree from '../workspace/FileTree';
import { useFileStore } from '../../lib/store';

export default function Sidebar() {
  const path = useFileStore(s => s.currentPath);
  return (
    <aside className="hidden md:block w-64 bg-white border-r p-4">
      <div className="mb-6">
        <h2 className="font-semibold">Workspace</h2>
        <p className="text-sm text-gray-500">{path || 'Root'}</p>
      </div>
      <FileTree />
    </aside>
  );
}