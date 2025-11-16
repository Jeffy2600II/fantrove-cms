'use client';
import React from 'react';
export default function FilePreview({ content }) {
  if (!content) return <div className="card">No Preview</div>;
  const isJson = (() => {
    try { JSON.parse(content); return true; } catch { return false; }
  })();
  return (
    <div className="card">
      <h4 className="font-semibold mb-2">Preview</h4>
      {isJson ? <pre className="text-sm overflow-auto">{JSON.stringify(JSON.parse(content), null, 2)}</pre> : <pre className="whitespace-pre-wrap text-sm">{content}</pre>}
    </div>
  );
}