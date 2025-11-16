'use client';
import React from 'react';

export default function TopBar({ onOpenSidebar, children }) {
  return (
    <header className="bg-white shadow p-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile: Hamburger btn */}
        <button onClick={onOpenSidebar} className="md:hidden p-2 rounded bg-gray-100 mr-2" aria-label="open sidebar">
          ☰
        </button>
        <h1 className="text-lg font-semibold">Fantrove Platform</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}