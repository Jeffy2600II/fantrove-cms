"use client";
import { useEffect, useState } from "react";
import { GithubFile } from "../types/index";
import Link from "next/link";

export default function FileList({ folder }: { folder: string }) {
  const [files, setFiles] = useState < GithubFile[] > ([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/files?folder=${folder}`)
      .then(res => res.json())
      .then(setFiles)
      .finally(() => setLoading(false));
  }, [folder]);
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <ul>
        {files.map(f => (
          <li key={f.sha} className="flex items-center border-b py-2">
            {f.type === "dir" ? (
              <Link href={`?folder=${f.path}`} className="font-bold text-blue-500">{f.name}/</Link>
            ) : (
              <>
                <span className="flex-1">{f.name}</span>
                {f.name.endsWith(".json") && (
                  <Link href={`/edit/${encodeURIComponent(f.path)}`} className="bg-indigo-500 text-white px-3 py-1 rounded">แก้ไข</Link>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}