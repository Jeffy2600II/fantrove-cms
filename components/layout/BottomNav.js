'use client';
import React from 'react';
export default function BottomNav({ onOpen }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around md:hidden z-30">
      <button onClick={() => onOpen('explorer')} className="text-center">
        📁 <div className="text-xs">Explorer</div>
      </button>
      <button onClick={() => onOpen('search')} className="text-center">
        🔎 <div className="text-xs">Search</div>
      </button>
      <button onClick={() => onOpen('create')} className="text-center">
        ➕ <div className="text-xs">Create</div>
      </button>
    </nav>
  );
}