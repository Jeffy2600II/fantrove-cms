import { useState, useEffect } from "react";

function isJsonParsable(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

interface JsonEditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [text, setText] = useState(value || '');
  const [valid, setValid] = useState(true);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  function handleChange(v: string) {
    setText(v);
    const ok = isJsonParsable(v);
    setValid(ok);
    onChange(v);
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="small">JSON Editor</div>
          <div className="small" style={{ color: valid ? 'green' : 'red' }}>
            {valid ? '✓ Valid JSON' : '✗ Invalid JSON'}
          </div>
        </div>
      </div>
      <textarea
        className="input"
        rows={20}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        style={{ fontFamily: 'monospace', fontSize: '12px' }}
      />
    </div>
  );
}