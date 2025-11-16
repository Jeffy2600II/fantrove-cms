'use client';
import React from 'react';
export default function FileProperties({ info }) {
  if (!info) return null;
  return (
    <div className="card">
      <h4 className="font-semibold mb-2">Properties</h4>
      <ul className="text-sm text-gray-600">
        <li><strong>Path:</strong> {info.path}</li>
        <li><strong>SHA:</strong> {info.sha}</li>
        <li><strong>Size:</strong> {info.size}</li>
      </ul>
    </div>
  );
}