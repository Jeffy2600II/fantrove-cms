import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url:string) => fetch(url).then(r=>r.json());

export default function HistoryPage(){
  const router = useRouter();
  const slug = router.query.path as string[] | undefined;
  const path = slug ? slug.join('/') : '';
  const { data, error } = useSWR(path ? `/api/github/commits?path=${encodeURIComponent(path)}` : null, fetcher);

  return (
    <div className="container">
      <div className="header">
        <h1>History: {path}</h1>
        <div>
          <Link href={`/edit/${encodeURIComponent(path)}`}><a><button className="button">Edit</button></a></Link>
        </div>
      </div>

      <div className="main">
        {error && <p>Failed to load commits.</p>}
        {!data && <p className="small">Loading...</p>}
        {data && Array.isArray(data) && (
          <div>
            {data.map((c:any)=>(
              <div key={c.sha} style={{padding:10, borderBottom:'1px solid #f1f5f9'}}>
                <div style={{display:'flex', justifyContent:'space-between', gap:12}}>
                  <div><strong>{c.commit?.message}</strong></div>
                  <div className="small">{new Date(c.commit?.author?.date).toLocaleString()}</div>
                </div>
                <div className="small">Author: {c.commit?.author?.name} ({c.author?.login || 'unknown'})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}