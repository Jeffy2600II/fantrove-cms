// components/FileSelectorModal.js
import { useEffect, useState } from 'react';

/*
 Props:
  - visible: boolean
  - onClose: () => void
  - onDone: (selectedPaths: string[]) => void
  - expanded: array from /api/github (each has meta, path, subcategories)
  - loading: boolean
*/
export default function FileSelectorModal({ visible, onClose, onDone, expanded = [], loading }) {
  const [selected, setSelected] = useState(new Set());
  
  useEffect(() => {
    if (!visible) setSelected(new Set());
  }, [visible]);
  
  function toggle(path) {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(path)) s.delete(path);
      else s.add(path);
      return s;
    });
  }
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{ width: '90%', maxWidth: 980, maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>เลือกไฟล์ (เพิ่มไปที่ composer)</h2>
          <div>
            <button onClick={() => { onClose(); }}>ปิด</button>
            <button style={{ marginLeft: 8 }} onClick={() => onDone(Array.from(selected))}>เสร็จสิ้น</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? <div>Loading files...</div> : (
            (expanded && expanded.length > 0) ? expanded.map(cat => {
              const catName = (cat.meta && (cat.meta.name && (cat.meta.name.th || cat.meta.name.en))) || cat.meta.id;
              return (
                <div key={cat.path} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{catName} <small style={{ color: '#666' }}>({cat.meta.id})</small></div>
                  <div style={{ paddingLeft: 12 }}>
                    {/* category root file */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={selected.has(cat.path)} onChange={() => toggle(cat.path)} />
                      <span style={{ color: '#333' }}>ไฟล์หมวด: {cat.path}</span>
                    </label>

                    {/* subcategories */}
                    {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ color: '#444', marginBottom: 6 }}>หมวดย่อย:</div>
                        {cat.subcategories.map(sc => (
                          <label key={sc.path} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12 }}>
                            <input type="checkbox" checked={selected.has(sc.path)} onChange={() => toggle(sc.path)} />
                            <span>{(sc.meta && (sc.meta.name && (sc.meta.name.th || sc.meta.name.en))) || sc.meta.id} — <small style={{ color: '#666' }}>{sc.path}</small></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : <div style={{ color: '#666' }}>ไม่มีไฟล์ในฐานข้อมูล</div>
          )}
        </div>
      </div>
    </div>
  );
}