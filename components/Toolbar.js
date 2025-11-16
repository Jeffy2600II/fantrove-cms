import React from 'react';

export default function Toolbar({
  onSave,
  onFormat,
  onDownload,
  onToggleWrap,
  canSave = false,
  isWrapped = true,
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-t dark:bg-gray-900 dark:border-gray-700">
      <button
        onClick={onSave}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm shadow-sm"
        disabled={!canSave}
      >
        💾 Save
      </button>

      <button
        onClick={onFormat}
        className="px-3 py-1 bg-green-500 text-white rounded text-sm shadow-sm"
      >
        🧹 Format
      </button>

      <button
        onClick={onToggleWrap}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
      >
        {isWrapped ? '↩︎ Wrap' : '⤢ No Wrap'}
      </button>

      <button
        onClick={onDownload}
        className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
      >
        ⤓ Download
      </button>

      <div className="ml-auto text-xs text-gray-500">Mobile-first IDE • Autosave</div>
    </div>
  );
}