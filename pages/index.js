// pages/index.js
import { useEffect, useState } from 'react';

function CategoryTree({ expanded, onRequestContent }) {
  if (!expanded || expanded.length === 0) return <div>ยังไม่มีข้อมูล</div>;
  
  return (
    <div>
      {expanded.map(cat => {
        const catName = (cat.meta.name && (cat.meta.name.th || cat.meta.name.en)) || cat.meta.id;
        return (
          <div key={cat.meta.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: '700', marginBottom: 8 }}>{catName} <small style={{ color: '#666' }}>({cat.meta.id})</small></div>

            {/* If the category itself contains direct data (flag only) */}
            {cat.hasDirectData && (
              <div style={{ paddingLeft: 8, marginBottom: 8 }}>
                <div style={{ color: '#666' }}>มีข้อมูลภายในหมวดนี้ (โหลดไฟล์เพื่อดูรายละเอียด)</div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => onRequestContent(cat.path)}>โหลดไฟล์หมวด</button>
                </div>
              </div>
            )}

            {/* Subcategories (meta-only listing) */}
            {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
              <div style={{ paddingLeft: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>หมวดย่อย</div>
                {cat.subcategories.map(sc => {
                  const scName = (sc.name && (sc.name.th || sc.name.en)) || sc.id;
                  // determine resolved path for subcategory file (support absolute or relative)
                  const scFile = (sc.file && String(sc.file)) || '';
                  const resolvedPath = scFile.startsWith('/') ? scFile : `/assets/db/con-data/${scFile}`;
                  return (
                    <div key={sc.id} style={{ marginBottom: 8, padding: 8, background: '#f9f9fb', borderRadius: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 600 }}>{scName} <small style={{ color: '#666' }}>({sc.id})</small></div>
                        <div style={{ marginLeft: 'auto' }}>
                          <button onClick={() => onRequestContent(resolvedPath)}>โหลดเนื้อหา</button>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, color: '#666' }}>
                        ไฟล์: {resolvedPath}
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
  const [selectedContent, setSelectedContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  
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
  
  async function loadFileContent(path) {
    setLoadingContent(true);
    setSelectedContent(null);
    try {
      const rr = await fetch('/api/github?path=' + encodeURIComponent(path));
      const dd = await rr.json();
      if (dd.contents && dd.contents.content) {
        // decode base64 content (browser atob)
        const text = atob(dd.contents.content);
        // try parse JSON else show raw text
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
        setSelectedContent({ path, content: parsed });
      } else {
        setSelectedContent({ path, content: null, error: dd.error || 'ไม่พบเนื้อหา' });
      }
    } catch (e) {
      setSelectedContent({ path, content: null, error: String(e) });
    } finally {
      setLoadingContent(false);
    }
  }
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Fantrove CMS — รายการไฟล์ (meta-only)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 480, maxHeight: '75vh', overflow: 'auto', border: '1px solid #e6e6e6', padding: 12, borderRadius: 6 }}>
          <h3>โครงสร้างไฟล์ (ไม่โหลดเนื้อหา)</h3>
          {loading ? <div>Loading...</div> : <CategoryTree expanded={expanded} onRequestContent={loadFileContent} />}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Preview / โหลดเนื้อหาแบบ on-demand</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 240 }}>
            {loadingContent ? <div>กำลังโหลด...</div> : (
              selectedContent ? (
                selectedContent.error ? <div style={{ color: 'red' }}>{selectedContent.error}</div> :
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 10, borderRadius: 4, maxHeight: '60vh', overflow: 'auto' }}>
                  {JSON.stringify(selectedContent.content, null, 2)}
                </pre>
              ) : 'กด "โหลดเนื้อหา" ที่ไฟล์ใด ๆ เพื่อดูรายละเอียด (on-demand)'}
          </div>

          <hr />
          <h3>หมายเหตุ</h3>
          <p style={{ color: '#666' }}>
            ระบบจะไม่แสดงเนื้อหาของไฟล์ทั้งหมดในครั้งเดียวอีกต่อไป — UI จะแสดงเฉพาะโครงสร้าง (meta) และจะโหลดเนื้อหาเมื่อผู้ใช้กดปุ่ม "โหลดเนื้อหา"
          </p>
        </div>
      </div>
    </div>
  );
}