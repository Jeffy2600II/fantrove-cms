'use client';
import React, { useState, useEffect } from 'react';
import { useFileStore } from '../../lib/store';
import { useFileManager } from '../../hooks/useFileManager';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export default function FileEditor() {
  const editorContent = useFileStore(s => s.editorContent);
  const editorSha = useFileStore(s => s.editorSha);
  const openFile = useFileStore(s => s.openFile);
  const setEditorContent = useFileStore(s => s.setEditorContent);
  const setOpenFile = useFileStore(s => s.setOpenFile);
  const { saveFile } = useFileManager();
  
  const [message, setMessage] = useState('');
  
  const saveNow = async () => {
    if (!openFile) return;
    try {
      await saveFile({ path: openFile, content: editorContent, sha: editorSha, message: `Update ${openFile}` });
      setMessage('Saved');
    } catch (e) {
      setMessage(e.message);
    }
  };
  
  useAutoSave(() => saveNow(), editorContent, 30000);
  
  useKeyboardShortcuts({
    'mod+s': () => saveNow()
  });
  
  if (!openFile) return <div className="card">No file open</div>;
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{openFile}</h3>
        <div className="flex gap-2">
          <button onClick={saveNow} className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
          <button onClick={() => setOpenFile(null)} className="px-3 py-1 bg-gray-200 rounded">Close</button>
        </div>
      </div>

      <textarea
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        className="w-full h-[48vh] p-3 border rounded font-mono text-sm"
      />

      {message && <div className="text-sm text-gray-500 mt-2">{message}</div>}
    </div>
  );
}