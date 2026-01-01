// pages/index.js
import { useEffect, useState } from 'react';

function FileList({ onSelect }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    fetch('/api/github')
      .then(r => r.json())
      .then(d => {
        // Support both old style (d.contents array) and new expanded index (d.index / d.expanded)
        if (Array.isArray(d.contents)) {
          setFiles(d.contents);
        } else if (d.index && Array.isArray(d.index.categories)) {
          // Build a flat list of category files (we show top-level category files)
          const list = d.index.categories.map(c => ({
            path: c.file.startsWith('/') ? c.file : `/assets/db/con-data/${c.file}`,
            name: (c.name && (c.name.th || c.name.en)) || c.id,
            type: 'file'
          }));
          setFiles(list);
        } else {
          setFiles([]);
        }
      }).catch(() => setFiles([]));
  }, []);
  return (
    <div>
      <h3>เลือกไฟล์ (เฉพาะ /assets/db/con-data)</h3>
      <ul>
        {files.map(f => (
          <li key={f.path}>
            <button onClick={async () => {
              const rr = await fetch('/api/github?path=' + encodeURIComponent(f.path));
              const dd = await rr.json();
              // if content object returned (file), fetch full file
              if (dd.contents && dd.contents.content) {
                const c = dd.contents;
                const text = atob(c.content);
                onSelect({ path: f.path, type: f.type, content: text });
              } else if (dd.index || dd.expanded) {
                // server returned expanded index — convert to readable JSON
                onSelect({ path: f.path, type: 'expanded', content: JSON.stringify(dd, null, 2) });
              } else {
                onSelect({ path: f.path, type: f.type, content: '' });
              }
            }}>{f.name || f.path}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aiText, setAiText] = useState('');
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);
  
  async function askAI() {
    setAiText('...');
    const r = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, fileContent: selected?.content || '' })
    });
    const j = await r.json();
    if (j.aiText) setAiText(j.aiText);
    else setAiText('No response');
  }
  
  async function previewActions() {
    setPreview(aiText);
  }
  
  async function execute() {
    setExecuting(true);
    const r = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionText: preview || aiText, actor: 'web-ui' })
    });
    const j = await r.json();
    setExecuting(false);
    if (j.ok) {
      alert('Executed: ' + JSON.stringify(j.results));
    } else {
      alert('Error: ' + j.error);
    }
  }
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Fantrove CMS — AI-Driven (ภาษาไทย)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 360 }}>
          <FileList onSelect={setSelected} />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Selected file</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 120 }}>
            {selected ? selected.content : 'ยังไม่ได้เลือกไฟล์'}
          </div>

          <h3>คำสั่ง (ภาษาไทย)</h3>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} style={{ width: '100%', height: 120 }} placeholder="พิมพ์คำสั่งเป็นภาษาไทย ..." />

          <div style={{ marginTop: 8 }}>
            <button onClick={askAI} disabled={!prompt}>ส่งให้ AI (OpenRouter)</button>
            <button onClick={previewActions} disabled={!aiText}>ดูตัวอย่าง Action</button>
            <button onClick={execute} disabled={!aiText || executing}>{executing ? 'กำลังทำ...' : 'ยืนยันและ Execute'}</button>
          </div>

          <h3>AI Action List (Preview)</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#fffbe6', padding: 10, minHeight: 120 }}>{aiText || 'ยังไม่มี'}</div>
        </div>
      </div>
      <hr />
      <p style={{ color: '#666' }}>
        หมายเหตุ: AI ภายในเว็บจะทำหน้าที่เป็น Content Planner เท่านั้น — คืนเฉพาะ "Action List"
      </p>
    </div>
  );
}