// pages/compose.js
import { useEffect, useState } from 'react';
import FileSelectorModal from '../components/FileSelectorModal';

export default function ComposePage() {
  const [expanded, setExpanded] = useState([]); // from /api/github { index, expanded }
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // { id, path, meta, content }
  const [prompt, setPrompt] = useState('');
  const [aiText, setAiText] = useState('');
  const [sending, setSending] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  // load expanded structure
  async function loadExpanded() {
    setLoading(true);
    try {
      const r = await fetch('/api/github');
      const j = await r.json();
      if (j.expanded && Array.isArray(j.expanded)) setExpanded(j.expanded);
      else setExpanded([]);
    } catch (e) {
      setExpanded([]);
      console.error('Failed to load expanded', e);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    loadExpanded();
  }, []);
  
  function addSelectedFromPaths(paths) {
    // paths: array of file paths (absolute or relative)
    const newItems = [];
    for (const p of paths) {
      // find matching in expanded (category file) or in subcategories
      let found = null;
      for (const cat of expanded) {
        if (cat.path === p || (cat.meta && (cat.meta.file === p || (`/assets/db/con-data/${cat.meta.file}`) === p))) {
          found = { id: cat.meta.id, path: cat.path, meta: cat.meta, content: cat.content };
          break;
        }
        if (Array.isArray(cat.subcategories)) {
          for (const sc of cat.subcategories) {
            if (sc.path === p || (sc.meta && (sc.meta.file === p || (`/assets/db/con-data/${sc.meta.file}`) === p))) {
              found = { id: sc.meta.id, path: sc.path, meta: sc.meta, content: sc.content };
              break;
            }
          }
        }
        if (found) break;
      }
      if (found) {
        // avoid duplicates by path
        if (!selectedFiles.some(s => s.path === found.path)) newItems.push(found);
      } else {
        console.warn('Selected path not found in expanded:', p);
      }
    }
    if (newItems.length) setSelectedFiles(prev => [...prev, ...newItems]);
  }
  
  function removeSelected(path) {
    setSelectedFiles(prev => prev.filter(p => p.path !== path));
  }
  
  async function sendToAI() {
    if (!prompt) return alert('โปรดพิมพ์ข้อความก่อนส่งให้ AI');
    setSending(true);
    try {
      // Build a friendly textual "fileContent" for AI: include selected files' name and summarized items (not code)
      const fileSummary = selectedFiles.map(f => {
        const title = (f.meta && (f.meta.name && (f.meta.name.th || f.meta.name.en))) || f.id || f.path;
        let body = '';
        if (f.content) {
          if (Array.isArray(f.content.data)) {
            const items = f.content.data.slice(0, 20).map(it => {
              const n = (it.name && (it.name.th || it.name.en)) || it.name || '';
              return `${it.text || ''} — ${n}`.trim();
            });
            body = `items:\n- ${items.join('\n- ')}`;
          } else if (Array.isArray(f.content.categories)) {
            const cats = f.content.categories.map(c => `${c.id}: ${(c.name && (c.name.th || c.name.en)) || c.name}`).slice(0, 20);
            body = `subcategories:\n- ${cats.join('\n- ')}`;
          } else {
            body = JSON.stringify(f.content).slice(0, 2000);
          }
        }
        return `File: ${title}\nPath: ${f.path}\n${body}`;
      }).join('\n\n');
      
      const combinedPrompt = `${prompt}\n\nContext files:\n${fileSummary || 'none'}`;
      
      const r = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: combinedPrompt, fileContent: fileSummary })
      });
      const j = await r.json();
      if (j.aiText) setAiText(j.aiText);
      else setAiText('AI ไม่ตอบกลับ (no aiText)');
    } catch (e) {
      console.error('AI request failed', e);
      setAiText('การขอ AI ล้มเหลว: ' + String(e));
    } finally {
      setSending(false);
    }
  }
  
  async function doExecute() {
    if (!aiText) return alert('ยังไม่มี Action List ให้ Execute');
    if (!confirm('จะดำเนินการตาม Action List หรือไม่? (การกระทำนี้จะ commit ไปยัง repo)')) return;
    setExecuting(true);
    try {
      const r = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionText: aiText, actor: 'web-ui' })
      });
      const j = await r.json();
      if (j.ok) {
        // refresh expanded and refresh selectedFiles content
        await loadExpanded();
        // map updated contents back into selectedFiles (match by id or path)
        setSelectedFiles(prev => prev.map(sel => {
          const updated = findInExpandedByPathOrId(expanded, sel.path, sel.id);
          return updated ? { ...sel, content: updated.content, path: updated.path } : sel;
        }));
        alert('Execute สำเร็จ: ' + JSON.stringify(j.results));
      } else {
        alert('Execute ล้มเหลว: ' + (j.error || 'unknown'));
      }
    } catch (e) {
      console.error('Execute error', e);
      alert('Execute error: ' + String(e));
    } finally {
      setExecuting(false);
    }
  }
  
  // helper to find updated entry in expanded (fresh data should be passed — we use expanded state after reload)
  function findInExpandedByPathOrId(exp, pathOrId, id) {
    for (const cat of exp || []) {
      if (cat.path === pathOrId || cat.meta?.id === id) return { path: cat.path, meta: cat.meta, content: cat.content };
      if (Array.isArray(cat.subcategories)) {
        for (const sc of cat.subcategories) {
          if (sc.path === pathOrId || sc.meta?.id === id) return { path: sc.path, meta: sc.meta, content: sc.content };
        }
      }
    }
    return null;
  }
  
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: 20 }}>
        <h1>Compose — ส่งข้อความหรือตั้งค่าเนื้อหาให้ AI</h1>
        <p style={{ color: '#666' }}>เลือกไฟล์จากฐานข้อมูลด้านซ้าย (ผ่าน overlay) แล้วพิมพ์ข้อความด้านล่างเพื่อส่งให้ AI — ไฟล์จะแสดงเป็นเนื้อหาแบบอ่านง่าย (ไม่ใช่โค้ด)</p>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 480, maxHeight: '70vh', overflow: 'auto', border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
            <h3>ไฟล์ที่เลือก</h3>
            {selectedFiles.length === 0 ? (
              <div style={{ color: '#777' }}>ยังไม่มีไฟล์ถูกเพิ่ม — กด "+" ด้านล่างเพื่อเลือกไฟล์</div>
            ) : (
              selectedFiles.map(f => {
                const title = (f.meta && (f.meta.name && (f.meta.name.th || f.meta.name.en))) || f.id || f.path;
                return (
                  <div key={f.path} style={{ marginBottom: 12, padding: 8, borderRadius: 6, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{title}</strong>
                      <span style={{ color: '#666' }}>({f.meta?.id || '-'})</span>
                      <button style={{ marginLeft: 'auto' }} onClick={() => removeSelected(f.path)}>Remove</button>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      {/* friendly preview of content (not code) */}
                      {f.content && Array.isArray(f.content.data) ? (
                        <ul style={{ marginTop: 8 }}>
                          {f.content.data.slice(0, 20).map((it, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 18 }}>{it.text || ''}</span>
                              <span>{(it.name && (it.name.th || it.name.en)) || it.name || it.api || ''}</span>
                            </li>
                          ))}
                        </ul>
                      ) : f.content && Array.isArray(f.content.categories) ? (
                        <div style={{ color: '#444' }}>
                          หมวดย่อย:
                          <ul>
                            {f.content.categories.map((c, idx) => (
                              <li key={idx}>{c.id} — {(c.name && (c.name.th || c.name.en)) || c.name}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div style={{ color: '#666' }}>ไม่มีข้อมูลตัวอย่างสำหรับไฟล์นี้</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3>AI Action List (Preview)</h3>
            <div style={{ minHeight: 160, background: '#fffbe6', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
              {aiText || <span style={{ color: '#777' }}>ยังไม่มีผลลัพธ์จาก AI</span>}
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={() => { setPrompt(''); setAiText(''); }}>Clear</button>
              <button style={{ marginLeft: 8 }} onClick={() => { setSelectedFiles([]); }}>Clear selected files</button>
              <button style={{ marginLeft: 8 }} onClick={loadExpanded}>Refresh files</button>
            </div>
          </div>
        </div>
      </div>

      {/* bottom input area (fixed) */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fff',
        borderTop: '1px solid #e6e6e6',
        padding: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
        <button title="เพิ่ม/เลือกไฟล์" onClick={() => setModalOpen(true)} style={{ width: 44, height: 44, fontSize: 20 }}>+</button>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="พิมพ์ข้อความที่ต้องการส่งให้ AI (ภาษาไทย)..."
          style={{ flex: 1, height: 64, padding: 8 }}
        />

        <button onClick={sendToAI} disabled={sending} style={{ padding: '8px 12px' }}>{sending ? 'กำลังส่ง...' : 'ส่งให้ AI'}</button>
        <button onClick={doExecute} disabled={executing || !aiText} style={{ padding: '8px 12px' }}>{executing ? 'กำลัง Execute...' : 'Execute'}</button>
      </div>

      <FileSelectorModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={(paths) => { addSelectedFromPaths(paths); setModalOpen(false); }}
        expanded={expanded}
        loading={loading}
      />
    </div>
  );
}