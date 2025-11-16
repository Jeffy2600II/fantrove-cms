'use client';
import React from 'react';
import Sidebar from './Sidebar';

export default function DrawerSidebar({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
        aria-label="Close Sidebar"
      />
      {/* Sidebar panel */}
      <div className="relative w-64 h-full bg-white shadow-xl z-50 animate-slidein">
        <Sidebar mobileMode={true} />
      </div>
      <style jsx global>{`
        @keyframes slidein {
          from { transform: translateX(-100%);}
          to { transform: translateX(0);}
        }
        .animate-slidein { animation: slidein 0.22s; }
      `}</style>
    </div>
  );
}