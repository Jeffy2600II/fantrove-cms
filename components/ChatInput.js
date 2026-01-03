// components/ChatInput.js
import { useState } from 'react';

/*
  Props:
  - selectedFiles: array of { categoryId, subcategoryId, title, summary, contentObj }
  - onOpenPicker()
  - onSend(prompt)
  - onRemoveFile(index)
*/

export default function ChatInput({ selectedFiles = [], onOpenPicker, onSend, onRemoveFile }) {
  const [text, setText] = useState('');
  
  function handleSend() {
    if (!text || text.trim().length === 0) return alert('กรุณาพิมพ์คำสั่งก่อนส่ง');
    onSend(text.trim());
    setText('');
  }
  
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedFiles.map((f, idx) => (
            <div key={idx} style={{ background: '#f3f6ff', padding: '6px 10px', borderRadius: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{f.summary}</div>
              <button onClick={() => onRemoveFile(idx)} style={{ marginLeft: 8 }}>x</button>
            </div>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onOpenPicker} style={{ padding: '8px 12px' }}>＋ เพิ่มไฟล์</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="พิมพ์คำสั่งเป็นภาษาไทย แล้วแนบไฟล์ด้านบน (ไม่แสดงโค้ดไฟล์) — ตัวอย่าง: 'สร้างหมวดหมู่ใหม่ ...'"
          style={{ flex: 1, minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #e6e6e6' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleSend} style={{ padding: '10px 14px', background: '#0066ff', color: '#fff', borderRadius: 8 }}>ส่งให้ AI</button>
          <button onClick={() => { setText(''); }} style={{ padding: '8px 12px' }}>ล้าง</button>
        </div>
      </div>
    </div>
  );
}