// pages/index.js
import { useEffect, useState } from 'react';
import FilePickerOverlay from '../components/FilePickerOverlay';
import ChatInput from '../components/ChatInput';

/*
  New "app-like" UI:
  - Left column: content structure (expanded)
  - Main column: content preview + AI results
  - Bottom fixed: ChatInput with + button opens FilePickerOverlay
  - No raw code/JSON shown to users (only human-friendly views)
*/

function CategoryList({ expanded, onOpenSubcategory }) {
  if (!expanded || expanded.length === 0) return <div>ยังไม่มีข้อมูล</div>;
  return (
    <div>
      {expanded.map(cat => {
        const catName = (cat.meta.name && (cat.meta.name.th || cat.meta.name.en)) || cat.meta.id;
        return (
          <div key={cat.meta.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, padding: '6px 0' }}>{catName} <small style={{ color: '#666' }}>{cat.meta.id}</small></div>
            <div style={{ paddingLeft: 8 }}>
              {/* If category has subcategories */}
              {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
                cat.subcategories.map(sc => {
                  const scName = (sc.meta.name && (sc.meta.name.th || sc.meta.name.en)) || sc.meta.id;
                  return (
                    <div key={sc.meta.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#fafafa', borderRadius: 6, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{scName}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{sc.meta.id}</div>
                      </div>
                      <div>
                        <button onClick={() => onOpenSubcategory(cat, sc)} style={{ padding: '6px 10px' }}>ดู</button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: '#666', fontSize: 13 }}>ไม่มีหมวดย่อย แสดงเนื้อหาในหมวดแทน</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentPanel({ current, onShowItem }) {
  // current: { category, subcategory, content } (content.data array)
  if (!current) {
    return <div style={{ color: '#666' }}>เลือกหมวดย่อยจากฝั่งซ้ายเพื่อดูเนื้อหา</div>;
  }
  const title = (current.subcategory.meta.name && (current.subcategory.meta.name.th || current.subcategory.meta.name.en)) || current.subcategory.meta.id;
  const items = (current.subcategory.content && current.subcategory.content.data) || [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ color: '#666' }}>{current.category.meta.id} / {current.subcategory.meta.id}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div style={{ color: '#666' }}>ยังไม่มีข้อมูลในหมวดย่อยนี้</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {items.map((it, idx) => {
              const name = (it.name && (it.name.th || it.name.en)) || it.name || it.api || `item-${idx+1}`;
              return (
                <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, background: '#fff' }}>
                  <div style={{ fontSize: 28 }}>{it.text || ' '}</div>
                  <div style={{ fontWeight: 600, marginTop: 8 }}>{name}</div>
                  <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>{it.api || ''}</div>
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button onClick={() => onShowItem(it)} style={{ padding: '6px 10px' }}>ดู</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [current, setCurrent] = useState(null); // { category, subcategory, content }
  const [aiResult, setAiResult] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // files added into chat input
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/github')
      .then(r => r.json())
      .then(d => {
        if (d.index && Array.isArray(d.expanded)) {
          setExpanded(d.expanded);
        } else {
          setExpanded([]);
        }
      })
      .catch(() => setExpanded([]))
      .finally(() => setLoading(false));
  }, []);
  
  function handleOpenSubcategory(category, subcategory) {
    setCurrent({ category, subcategory, content: subcategory.content || { data: [] } });
    setAiResult(null); // clear AI result view when switching
  }
  
  function handleShowItem(item) {
    // show item in right panel as simple detail card (no code)
    setAiResult({ type: 'itemDetail', item });
  }
  
  function handleAddFiles(files) {
    // files: array of { category, subcategory, content }
    // We store lightweight preview objects only (no raw JSON text)
    const newOnes = files.map(f => ({
      categoryId: f.category.meta.id,
      subcategoryId: f.subcategory.meta.id,
      title: (f.subcategory.meta.name && (f.subcategory.meta.name.th || f.subcategory.meta.name.en)) || f.subcategory.meta.id,
      summary: `${(f.subcategory.content && (f.subcategory.content.data || []).length) || 0} รายการ`,
      // store the content object for sending to AI (we will stringify only what AI needs)
      contentObj: f.subcategory.content || null
    }));
    setSelectedFiles(prev => [...prev, ...newOnes]);
    setOverlayOpen(false);
  }
  
  async function handleSendToAI(prompt) {
    // combine prompt + selected files content (stringify minimal)
    const fileContents = selectedFiles.map(sf => ({
      category: sf.categoryId,
      subcategory: sf.subcategoryId,
      itemsCount: (sf.contentObj && sf.contentObj.data && sf.contentObj.data.length) || 0,
      // include the first few items as examples for context (human-readable)
      examples: (sf.contentObj && sf.contentObj.data && sf.contentObj.data.slice(0, 5).map(it => ({
        text: it.text,
        name_th: it.name && it.name.th,
        name_en: it.name && it.name.en
      }))) || []
    }));
    const combined = `Prompt:\n${prompt}\n\nAttached files (summary):\n${JSON.stringify(fileContents, null, 2)}`;
    setAiResult({ type: 'loading' });
    try {
      const r = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, fileContent: combined })
      });
      const j = await r.json();
      if (j.aiText) {
        // show AI text as action list (plain text). Do not show raw JSON
        setAiResult({ type: 'aiText', text: j.aiText });
      } else {
        setAiResult({ type: 'error', message: j.error || 'No response from AI' });
      }
    } catch (err) {
      setAiResult({ type: 'error', message: err.message || String(err) });
    }
  }
  
  return (
    <div style={{ paddingBottom: 120 /* leave room for fixed input */ }}>
      <div style={{ display: 'flex', gap: 20, padding: 20 }}>
        <div style={{ width: 360, border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, height: '75vh', overflow: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>โครงสร้างเนื้อหา</h3>
          {loading ? <div>Loading...</div> : <CategoryList expanded={expanded} onOpenSubcategory={handleOpenSubcategory} />}
        </div>

        <div style={{ flex: 1, minHeight: '60vh' }}>
          <div style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 16, minHeight: 300 }}>
            <ContentPanel current={current} onShowItem={handleShowItem} />
          </div>

          <div style={{ marginTop: 12 }}>
            <h3>ผลลัพธ์ AI / รายละเอียด</h3>
            <div style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, minHeight: 160, background: '#fff' }}>
              {aiResult == null && <div style={{ color: '#666' }}>ผลลัพธ์จะปรากฏที่นี่หลังส่งคำสั่งให้ AI</div>}
              {aiResult && aiResult.type === 'loading' && <div>กำลังติดต่อ AI...</div>}
              {aiResult && aiResult.type === 'aiText' && (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{aiResult.text}</div>
              )}
              {aiResult && aiResult.type === 'itemDetail' && (
                <div>
                  <div style={{ fontWeight: 700 }}>{(aiResult.item.name && (aiResult.item.name.th || aiResult.item.name.en)) || aiResult.item.api}</div>
                  <div style={{ fontSize: 28, marginTop: 8 }}>{aiResult.item.text}</div>
                  <div style={{ color: '#666', marginTop: 8 }}>API: {aiResult.item.api}</div>
                </div>
              )}
              {aiResult && aiResult.type === 'error' && <div style={{ color: 'crimson' }}>{aiResult.message}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* File picker overlay */}
      <FilePickerOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        expanded={expanded}
        onAdd={handleAddFiles}
      />

      {/* Bottom fixed chat input */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, borderTop: '1px solid #e6e6e6',
        background: '#fff', padding: 12, boxShadow: '0 -4px 20px rgba(0,0,0,0.04)'
      }}>
        <ChatInput
          selectedFiles={selectedFiles}
          onOpenPicker={() => setOverlayOpen(true)}
          onSend={handleSendToAI}
          onRemoveFile={(idx) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
        />
      </div>
    </div>
  );
}