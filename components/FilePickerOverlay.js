// components/FilePickerOverlay.js
import { useState, useEffect } from 'react';

/*
  Props:
  - open (bool)
  - onClose()
  - expanded: data from /api/github (array of categories with subcategories)
  - onAdd(selectedFiles) => selectedFiles: [{ category, subcategory, content }]
*/

export default function FilePickerOverlay({ open, onClose, expanded = [], onAdd }) {
  const [selectedMap, setSelectedMap] = useState({});
  
  useEffect(() => {
    if (!open) setSelectedMap({});
  }, [open]);
  
  function toggleSelect(catId, scId, catObj, scObj) {
    const key = `${catId}:::${scId}`;
    setSelectedMap(prev => {
      const copy = { ...prev };
      if (copy[key]) delete copy[key];
      else copy[key] = { category: catObj, subcategory: scObj, key };
      return copy;
    });
  }
  
  function handleAdd() {
    const arr = Object.values(selectedMap);
    onAdd(arr);
  }
  
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200
    }}>
      <div style={{ width: '90%', maxWidth: 980, maxHeight: '85vh', background: '#fff', borderRadius: 10, overflow: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>เพิ่มไฟล์เข้าสู่คำสั่ง (เลือกได้หลายรายการ)</h3>
          <div>
            <button onClick={onClose} style={{ marginRight: 8 }}>ปิด</button>
            <button onClick={handleAdd} style={{ padding: '8px 12px' }}>เสร็จสิ้น ({Object.keys(selectedMap).length})</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {expanded && expanded.length > 0 ? expanded.map(cat => (
            <div key={cat.meta.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{(cat.meta.name && (cat.meta.name.th || cat.meta.name.en)) || cat.meta.id}</div>
              <div style={{ paddingLeft: 12, marginTop: 8 }}>
                {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? cat.subcategories.map(sc => {
                  const key = `${cat.meta.id}:::${sc.meta.id}`;
                  const checked = !!selectedMap[key];
                  return (
                    <label key={sc.meta.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: checked ? '#f0f7ff' : '#fafafa', marginBottom: 6, borderRadius: 6 }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleSelect(cat.meta.id, sc.meta.id, cat, sc)} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{(sc.meta.name && (sc.meta.name.th || sc.meta.name.en)) || sc.meta.id}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{sc.meta.id} • {(sc.content && sc.content.data && sc.content.data.length) || 0} รายการ</div>
                      </div>
                    </label>
                  );
                }) : <div style={{ color: '#666' }}>ไม่มีหมวดย่อย</div>}
              </div>
            </div>
          )) : <div style={{ color: '#666' }}>ไม่พบข้อมูล</div>}
        </div>
      </div>
    </div>
  );
}