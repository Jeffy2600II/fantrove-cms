"use client";
import { useState } from "react";

export default function JsonEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [local, setLocal] = useState(value);
  const [valid, setValid] = useState(true);
  
  function handleChange(e: React.ChangeEvent < HTMLTextAreaElement > ) {
    setLocal(e.target.value);
    try {
      JSON.parse(e.target.value);
      setValid(true);
      onChange(e.target.value);
    } catch {
      setValid(false);
    }
  }
  
  return (
    <div>
      <textarea
        className="w-full h-64 p-2 border rounded"
        value={local}
        onChange={handleChange}
        spellCheck={false}
      />
      <div className={valid ? "text-green-600 mt-2" : "text-red-600 mt-2"}>
        {valid ? "Valid JSON" : "Invalid JSON"}
      </div>
    </div>
  );
}