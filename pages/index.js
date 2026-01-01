// pages/index.js
import { useEffect, useState } from 'react';

function CategoryList({ tree, onFetchContent, onSelectMeta }) {
  if (!tree || tree.length === 0) return <div>ยังไม่มีข้อมูล</div>;
  
  return (
    <div>
      {tree.map(cat => {
        const catLabel = (cat.name && (cat.name.th || cat.name.en)) || cat.id;
        return (
          <div key={cat.id} style={{ marginBottom: 16, border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {catLabel} <small style={{ color: '#666' }}>({cat.id})</small>
            </div>

            <div style={{ paddingLeft: 8, marginBottom: 8 }}>
              <div style={{ color: '#666' }}>
                ข้อมูลภายในไฟล์: {cat.hasData ? `${cat.dataCount} รายการ` : 'ไม่มี'} — ไฟล์: <code style={{ background: '#f0f0f0', padding: '2px 6px' }}>{cat.path}</code>
              </div>
            </div>

            {cat.subcategories && cat.subcategories.length > 0 && (
              <div style={{ paddingLeft: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>หมวดย่อย</div>
                {cat.subcategories.map(sc => {
                  const scLabel = (sc.name && (sc.name.th || sc.name.en)) || sc.id;
                  return (
                    <div key={sc.id} style={{ marginBottom: 8, padding: 8, background: '#f9f9fb', borderRadius: 4 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{scLabel} <small style={{ color: '#666' }}>({sc.id})</small></div>
                        <div style={{ color: '#666', marginLeft: 'auto' }}><code style={{ background: '#fff', padding: '2px 6px' }}>{sc.path}</code></div>
                      </div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={() => onSelectMeta({ type: 'subcategory', meta: sc, parent: cat.id })}>แสดงเมตา</button>
                        <button onClick={() => onFetchContent(sc.path)}>ดูเนื้อหา</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* If category itself contains data (some categories may store data directly) */}
            {cat.hasData && (
              <div style={{ paddingLeft: 8, marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>ไฟล์ข้อมูลของหมวด (เปิดเพื่อดูเนื้อหา)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onSelectMeta({ type: 'category', meta: cat })}>แสดงเมตาของหมวด</button>
                  <button onClick={() => onFetchContent(cat.path)}>ดูเนื้อหาไฟล์หมวด</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null); // { kind: 'meta'|'content', data: ... }
  const [fetching, setFetching] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/github')
      .then(r => r.json())
      .then(d => {
        if (d.tree && Array.isArray(d.tree)) {
          setTree(d.tree);
        } else {
          setTree([]);
        }
      })
      .catch(() => setTree([]))
      .finally(() => setLoading(false));
  }, []);
  
  async function handleFetchContent(path) {
    if (!path) return;
    setFetching(true);
    try {
      const r = await fetch('/api/github?path=' + encodeURIComponent(path));
      const dd = await r.json();
      if (dd.contents && dd.contents.content) {
        // decode base64 content in browser
        const b64 = dd.contents.content;
        // browser-safe decode
        let text = '';
        try {
          text = atob(b64);
        } catch (e) {
          // fallback: try decode via ArrayBuffer if needed
          text = b64;
        }
        setPreview({ kind: 'content', path, text });
      } else {
        setPreview({ kind: 'error', message: 'ไม่พบเนื้อหาในไฟล์' });
      }
    } catch (err) {
      setPreview({ kind: 'error', message: String(err) });
    } finally {
      setFetching(false);
    }
  }
  
  function handleSelectMeta(obj) {
    // obj: { type: 'subcategory'|'category', meta, parent? }
    setPreview({ kind: 'meta', data: obj });
  }
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Fantrove CMS — รายการเนื้อหา (ลิสโครงสร้างเท่านั้น)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 520, maxHeight: '75vh', overflow: 'auto', border: '1px solid #e6e6e6', padding: 12, borderRadius: 6 }}>
          <h3>โครงสร้างเนื้อหา</h3>
          {loading ? <div>Loading...</div> : <CategoryList tree={tree} onFetchContent={handleFetchContent} onSelectMeta={handleSelectMeta} />}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Preview / รายละเอียด</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 240 }}>
            {preview ? (
              preview.kind === 'meta' ? (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>ชนิด:</strong> {preview.data.type} &nbsp;
                    <strong>parent:</strong> {preview.data.parent || '-'}
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 10, borderRadius: 4, maxHeight: '60vh', overflow: 'auto' }}>
                    {JSON.stringify(preview.data.meta, null, 2)}
                  </pre>
                </div>
              ) : preview.kind === 'content' ? (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>ไฟล์:</strong> {preview.path}
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 10, borderRadius: 4, maxHeight: '60vh', overflow: 'auto' }}>
                    {preview.text}
                  </pre>
                </div>
              ) : (
                <div style={{ color: 'red' }}>{preview.message}</div>
              )
            ) : (
              'เลือก "ดูเนื้อหา" หรือ "แสดงเมตา" เพื่อดูรายละเอียด'
            )}
          </div>

          <hr />
          <h3>AI & การแก้ไข</h3>
          <p style={{ color: '#666' }}>
            ระบบจะแยกการ "ลิสโครงสร้าง" กับ "โหลดเนื้อหา" ออกจากกัน — การแก้ไฟล์จะยังคงผ่าน flow AI → Action List → Execute
          </p>
        </div>
      </div>
    </div>
  );
}