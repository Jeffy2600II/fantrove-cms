'use client';
import React from 'react';
import { useFileStore } from '../../lib/store';

export default function TopBar({ onOpenSidebar, children }) {
  const toast = useFileStore(s => s.toast);
  return (
    <header className="bg-white shadow p-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger only on mobile */}
        <button
          className="md:hidden p-2 rounded bg-gray-100"
          onClick={() => onOpenSidebar && onOpenSidebar()}
          aria-label="Open Sidebar"
        >☰</button>
        <h1 className="text-lg font-semibold">Fantrove Platform</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
      {toast && (
        <div className={`fixed right-4 bottom-6 p-3 rounded ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {toast.message}
        </div>
      )}
    </header>
  );
}