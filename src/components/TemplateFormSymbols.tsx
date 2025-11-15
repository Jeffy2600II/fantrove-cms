import { useState, useEffect } from 'react';
import JsonEditor from './JsonEditor';

interface TemplateFormSymbolsProps {
  initialJson: any;
  onChange: (json: any) => void;
  onSave?: () => void;
}

export default function TemplateFormSymbols({
  initialJson,
  onChange,
  onSave,
}: TemplateFormSymbolsProps) {
  const [data, setData] = useState<any>(initialJson || []);

  useEffect(() => {
    setData(initialJson || []);
  }, [initialJson]);

  function addSymbol() {
    const next = Array.isArray(data) ? [...data] : [];
    next.push({
      id: `sym_${Date.now()}`,
      type: 'button',
      content: '★',
    });
    setData(next);
    onChange(next);
  }

  function removeSymbol(idx: number) {
    const next = Array.isArray(data) ? [...data] : [];
    next.splice(idx, 1);
    setData(next);
    onChange(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button" onClick={addSymbol}>
            + Add Symbol
          </button>
          <button className="button" style={{ background: '#10b981' }} onClick={() => onSave && onSave()}>
            Save
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <h4>Symbols List</h4>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {(Array.isArray(data) ? data : []).map((s: any, idx: number) => (
              <div
                key={s.id || idx}
                style={{
                  padding: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  marginBottom: 8,
                  background: '#fafbfc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '18px' }}>{s.content}</div>
                  <div className="small">{s.id}</div>
                </div>
                <button
                  className="button"
                  style={{ background: '#ef4444', padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => removeSymbol(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4>Raw JSON</h4>
          <JsonEditor
            value={JSON.stringify(data, null, 2)}
            onChange={(txt) => {
              try {
                const parsed = JSON.parse(txt);
                setData(parsed);
                onChange(parsed);
              } catch {}
            }}
          />
        </div>
      </div>
    </div>
  );
}