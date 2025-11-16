'use client';
import React from 'react';
import FileTree from '../workspace/FileTree';
import { useFileStore } from '../../lib/store';

export default function Sidebar({ open, onClose }) {
  const currentPath = useFileStore(s => s.currentPath);
  
  // Desktop: แสดง sidebar ปกติ, Mobile: แสดงเป็น Drawer/Overlay
  return (
    <>
      {/* --- MOBILE SIDEBAR --- */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-40 transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-bold">Workspace</span>
          <button onClick={onClose} className="text-xl">&times;</button>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-2">{currentPath || 'Root'}</p>
          <FileTree />
        </div>
      </div>
      {/* Overlay */}
      {open &&
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="close sidebar"
        />
      }

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:block w-64 bg-white border-r h-screen overflow-y-auto">
        <div className="p-4 border-b font-bold">Workspace</div>
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-2">{currentPath || 'Root'}</p>
          <FileTree />
        </div>
      </aside>
    </>
  );
}