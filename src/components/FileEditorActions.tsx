"use client";
import { useState } from "react";

export default function FileEditorActions({ filename, content, sha }: { filename: string, content: string, sha: string }) {
  const [msg, setMsg] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  async function handleCommit() {
    setLoading(true);
    const res = await fetch("/api/commit", {
      method: "POST",
      body: JSON.stringify({ filename, content, sha, message: msg, isNew: false }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    setResponse(result.success ? "Commit Success!" : `Error: ${result.error}`);
    setLoading(false);
  }
  
  async function handleDelete() {
    setLoading(true);
    const res = await fetch("/api/commit", {
      method: "POST",
      body: JSON.stringify({ filename, sha, message: msg, deleteFile: true }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    setResponse(result.success ? "Delete Success!" : `Error: ${result.error}`);
    setLoading(false);
  }
  
  return (
    <div className="mt-4 flex flex-col gap-2">
      <input
        className="border p-2"
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Commit message"
      />
      <div className="flex gap-4">
        <button onClick={handleCommit} className="bg-green-500 px-4 py-2 rounded text-white" disabled={loading}>
          Commit
        </button>
        <button onClick={handleDelete} className="bg-red-500 px-4 py-2 rounded text-white" disabled={loading}>
          Delete
        </button>
      </div>
      {response && <div className="mt-2">{response}</div>}
    </div>
  );
}