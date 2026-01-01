// pages/index.js
import { useEffect, useState } from 'react';

function CategoryTree({ expanded, onPreview }) {
  if (!expanded || expanded.length === 0) return <div>ยังไม่มีข้อมูล</div>;
  
  return (
    <div>
      {expanded.map(cat => {
        const catName = (cat.meta.name && (cat.meta.name.th || cat.meta.name.en)) || cat.meta.id;
        return (
          <div key={cat.meta.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: '700', marginBottom: 8 }}>{catName} <small style={{ color: '#666' }}>({cat.meta.id})</small></div>

            {/* If category has direct data (some categories may contain data array) */}
            {cat.content && Array.isArray(cat.content.data) && (
              <div style={{ paddingLeft: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>ข้อมูลภายในหมวด</div>
                <ul>
                  {cat.content.data.map((it, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{it.text || ''}</span>
                      <span>{(it.name && (it.name.th || it.name.en)) || it.name || it.api || 'unnamed'}</span>
                      <button style={{ marginLeft: 'auto' }} onClick={() => onPreview({ type: 'item', meta: it, parent: cat.meta.id })}>ดูรายละเอียด</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subcategories */}
            {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
              <div style={{ paddingLeft: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>หมวดย่อย</div>
                {cat.subcategories.map(sc => {
                  const scName = (sc.meta.name && (sc.meta.name.th || sc.meta.name.en)) || sc.meta.id;
                  return (
                    <div key={sc.meta.id} style={{ marginBottom: 8, padding: 8, background: '#f9f9fb', borderRadius: 4 }}>
                      <div style={{ fontWeight: 600 }}>{scName} <small style={{ color: '#666' }}>({sc.meta.id})</small></div>
                      {/* Show short preview of items */}
                      <div style={{ marginTop: 6 }}>
                        {sc.content && Array.isArray(sc.content.data) && sc.content.data.length > 0 ? (
                          <ul>
                            {sc.content.data.map((it, idx) => (
                              <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>{it.text || ''}</span>
                                <span>{(it.name && (it.name.th || it.name.en)) || it.name || it.api || 'unnamed'}</span>
                                <button style={{ marginLeft: 'auto' }} onClick={() => onPreview({ type: 'item', meta: it, parent: sc.meta.id })}>ดู</button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ color: '#666' }}>ไม่มีข้อมูลภายในหมวดย่อยนี้</div>
                        )}
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <button onClick={() => onPreview({ type: 'subcategory', meta: sc.meta, content: sc.content, parent: cat.meta.id })}>ดู JSON ของหมวดย่อย</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/github')
      .then(r => r.json())
      .then(d => {
        if (d.index && Array.isArray(d.expanded)) {
          setExpanded(d.expanded);
        } else if (Array.isArray(d.contents)) {
          // fallback: map contents to simple entries
          const list = d.contents.map(c => ({ meta: { id: c.path, name: c.name || c.path }, path: c.path }));
          setExpanded(list);
        } else {
          setExpanded([]);
        }
      })
      .catch(() => setExpanded([]))
      .finally(() => setLoading(false));
  }, []);
  
  function handlePreview(obj) {
    // obj: { type: 'item'|'subcategory', meta, content?, parent }
    setSelectedPreview(obj);
  }
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Fantrove CMS — รายการเนื้อหา (ขยายทั้งหมด)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 480, maxHeight: '75vh', overflow: 'auto', border: '1px solid #e6e6e6', padding: 12, borderRadius: 6 }}>
          <h3>โครงสร้างเนื้อหา</h3>
          {loading ? <div>Loading...</div> : <CategoryTree expanded={expanded} onPreview={handlePreview} />}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Preview / รายละเอียด</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 240 }}>
            {selectedPreview ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <strong>ชนิด:</strong> {selectedPreview.type} &nbsp;
                  <strong>parent:</strong> {selectedPreview.parent || '-'}
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 10, borderRadius: 4, maxHeight: '60vh', overflow: 'auto' }}>
                  {JSON.stringify(selectedPreview.content || selectedPreview.meta, null, 2)}
                </pre>
              </div>
            ) : (
              'เลือก "ดู" เพื่อแสดงรายละเอียด here'
            )}
          </div>

          <hr />
          <h3>AI & การแก้ไข</h3>
          <p style={{ color: '#666' }}>
            หากต้องการใช้ AI เพื่อสร้าง Action List ให้เลือกหมวดย่อยที่ต้องการ (หรือพิมพ์คำสั่ง) แล้วส่งไปยัง AI — หลังจากได้ Action List แล้วกด Execute เพื่อให้ระบบแก้ไฟล์
          </p>
        </div>
      </div>
    </div>
  );
}