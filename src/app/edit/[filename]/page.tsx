"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JsonEditor from "../../../components/JsonEditor";
import FileEditorActions from "../../../components/FileEditorActions";

export default function EditPage() {
  const { filename } = useParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/file/${filename}`)
      .then(res => res.json())
      .then(({ decoded, sha }) => {
        setContent(decoded);
        setSha(sha);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [filename]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div>
      <h1 className="font-bold text-xl mb-4">แก้ไขไฟล์: {filename}</h1>
      <JsonEditor value={content} onChange={setContent} />
      <FileEditorActions filename={filename} content={content} sha={sha} />
    </div>
  );
}