import { useState, useEffect } from 'react';
import JsonEditor from './JsonEditor';

interface TemplateFormEmojiProps {
  initialJson: any;
  onChange: (json: any) => void;
  onSave?: () => void;
}

export default function TemplateFormEmoji({
  initialJson,
  onChange,
  onSave,
}: TemplateFormEmojiProps) {
  const [data, setData] = useState<any>(initialJson || {});
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setData(initialJson || {});
  }, [initialJson]);

  function addType() {
    const next = { ...data };
    if (!next.type) next.type = [];
    next.type.push({
      id: `type_${Date.now()}`,
      name: { en: 'New Type', th: 'ประเภทใหม่' },
      category: [],
    });
    setData(next);
    onChange(next);
  }

  function addCategory(typeIndex: number) {
    const next = { ...data };
    if (!next.type[typeIndex].category) next.type[typeIndex].category = [];
    next.type[typeIndex].category.push({
      id: `cat_${Date.now()}`,
      name: { en: 'New Category', th: 'หมวดใหม่' },
      data: [],
    });
    setData(next);
    onChange(next);
  }

  function addEmoji(typeIndex: number, catIndex: number) {
    const next = { ...data };
    next.type[typeIndex].category[catIndex].data.push({
      api: 'U+1F600',
      text: '😀',
      name: { en: 'Grinning Face', th: 'หน้ายิ้ม' },
    });
    setData(next);
    onChange(next);
  }

  function validateAndPrepare() {
    if (!data || !data.type || !Array.isArray(data.type)) {
      setError('Invalid structure: missing type array');
      return false;
    }
    setError(undefined);
    onChange(data);
    return true;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button" onClick={addType}>
            + Add Type
          </button>
          <button
            className="button"
            style={{ background: '#10b981' }}
            onClick={() => {
              if (validateAndPrepare()) onSave && onSave();
            }}
          >
            Save
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <div>
          {data?.type?.map((t: any, ti: number) => (
            <div
              key={t.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                background: '#fafbfc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>{t.name?.en || t.id}</strong>
                <button className="button" onClick={() => addCategory(ti)}>
                  + Category
                </button>
              </div>
              <div style={{ marginLeft: 12 }}>
                {(t.category || []).map((c: any, ci: number) => (
                  <div
                    key={c.id}
                    style={{
                      padding: 8,
                      border: '1px dashed #d1d5db',
                      marginBottom: 8,
                      borderRadius: 6,
                      background: 'white',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div className="small" style={{ fontWeight: 600 }}>
                        {c.name?.en || c.id}
                      </div>
                      <button className="button" style={{ fontSize: '12px' }} onClick={() => addEmoji(ti, ci)}>
                        + Emoji
                      </button>
                    </div>
                    <div>
                      {(c.data || []).slice(0, 10).map((it: any, idx: number) => (
                        <div key={idx} className="small">
                          {it.text} — {it.name?.en || it.api}
                        </div>
                      ))}
                      {(c.data || []).length > 10 && (
                        <div className="small">... and {(c.data || []).length - 10} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4>Raw JSON Preview</h4>
          <JsonEditor
            value={JSON.stringify(data, null, 2)}
            onChange={(txt) => {
              try {
                const parsed = JSON.parse(txt);
                setData(parsed);
                onChange(parsed);
                setError(undefined);
              } catch (e) {
                setError('Invalid JSON');
              }
            }}
          />
        </div>
      </div>
      {error && <div style={{ color: '#dc2626', marginTop: 8 }}>⚠ {error}</div>}
    </div>
  );
}