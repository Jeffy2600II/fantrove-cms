import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import JsonEditor from '@/components/JsonEditor';
import TemplateFormEmoji from '@/components/TemplateFormEmoji';
import TemplateFormSymbols from '@/components/TemplateFormSymbols';
import CommitDialog from '@/components/CommitDialog';
import Notification from '@/components/Notification';

const fetcher = (url:string) => fetch(url).then(r=>r.json());

export default function EditPage() {
  const router = useRouter();
  const slug = router.query.path as string[] | undefined;
  const path = slug ? slug.join('/') : '';
  const { data, error, mutate } = useSWR(path ? `/api/github/contents?path=${encodeURIComponent(path)}` : null, fetcher);

  const [jsonText, setJsonText] = useState<string>('');
  const [showCommit, setShowCommit] = useState(false);
  const [notif, setNotif] = useState<{type:'success'|'error'|'info', msg:string}|null>(null);

  useEffect(()=>{
    if (data && data.content) {
      // content returned raw text
      setJsonText(JSON.stringify(data.content, null, 2));
    }
  }, [data]);

  if (!path) return <div className="container"><p>Invalid path</p></div>;
  if (error) return <div className="container"><p>Failed to load file.</p></div>;

  function handleSave(newContent: string) {
    setJsonText(newContent);
    setShowCommit(true);
  }

  async function doCommit(message: string) {
    try {
      const res = await fetch('/api/github/commit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ path, content: jsonText, message })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'Commit failed');
      setNotif({type:'success', msg:'Committed successfully'});
      setShowCommit(false);
      await mutate();
    } catch (err:any) {
      setNotif({type:'error', msg:err.message || 'Commit error'});
    }
  }

  // choose template by filename heuristics
  const fname = path.split('/').slice(-1)[0] || '';
  const isEmoji = fname.toLowerCase().includes('emoji') || path.includes('/assets/db/') || path.includes('db.min.json');
  const isSymbols = fname.toLowerCase().includes('symbol');

  return (
    <div className="container">
      <div className="header">
        <h1>Edit: {path}</h1>
        <div>
          <button className="button" onClick={()=>router.push('/')}>Back</button>
        </div>
      </div>

      <div className="main">
        <div style={{display:'flex', gap:12, alignItems:'center', justifyContent:'space-between'}}>
          <div className="small">Editing file: {path}</div>
          <div>
            <button className="button" onClick={()=>handleSave(jsonText)}>Save</button>
          </div>
        </div>

        <div style={{height:12}} />

        {data ? (
          <>
            {isEmoji ? (
              <TemplateFormEmoji initialJson={data.content} onChange={(json)=>setJsonText(JSON.stringify(json, null, 2))} onSave={()=>handleSave(jsonText)} />
            ) : isSymbols ? (
              <TemplateFormSymbols initialJson={data.content} onChange={(json)=>setJsonText(JSON.stringify(json, null, 2))} onSave={()=>handleSave(jsonText)} />
            ) : (
              <JsonEditor value={jsonText} onChange={setJsonText} />
            )}

            {showCommit && <CommitDialog onClose={()=>setShowCommit(false)} onCommit={doCommit} defaultMessage={`Update ${path}`} />}
            {notif && <Notification type={notif.type} message={notif.msg} onClose={()=>setNotif(null)} />}
          </>
        ) : <p className="small">Loading content...</p>}
      </div>
    </div>
  );
}