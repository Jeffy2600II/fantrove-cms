'use client';
import React from 'react';

export default function ContextMenu({ x, y, items = [], visible }) {
  if (!visible) return null;
  return (
    <ul style={{ left: x, top: y }} className="absolute bg-white border rounded shadow p-2 z-40">
      {items.map((it, i) => (
        <li key={i}>
          <button onClick={it.onClick} className="block w-full text-left p-2 hover:bg-gray-100">
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}