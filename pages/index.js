// pages/index.js
import { useEffect, useState, useCallback } from 'react';

/*
  SPA single-page app behavior with hash routing.
  Routes:
    #/               -> home (list of categories)
    #/category/:id   -> category view (shows subcategories)
    #/subcategory/:categoryId/:subId -> subcategory view (shows data items)
    #/file/:base64path -> raw file view (path encoded)
*/

function decodePathFromHash(hashPart) {
  try {
    return decodeURIComponent(atob(hashPart));
  } catch (e) {
    return null;
  }
}

function encodePathToHash(path) {
  try {
    return btoa(encodeURIComponent(path));
  } catch (e) {
    return '';
  }
}

function useHashRoute() {
  const parse = () => {
    const h = (typeof window !== 'undefined' ? window.location.hash : '') || '';
    if (!h || h === '#' || h === '#/') return { page: 'home' };
    const parts = h.replace(/^#\/?/, '').split('/');
    if (parts[0] === 'category' && parts[1]) return { page: 'category', id: parts[1] };
    if (parts[0] === 'subcategory' && parts[1] && parts[2]) return { page: 'subcategory', categoryId: parts[1], subId: parts[2] };
    if (parts[0] === 'file' && parts[1]) {
      const p = decodePathFromHash(parts[1]);
      return { page: 'file', path: p };
    }
    return { page: 'home' };
  };

  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to) => {
    if (to.page === 'home') {
      window.location.hash = '/';
    } else if (to.page === 'category') {
      window.location.hash = `/category/${to.id}`;
    } else if (to.page === 'subcategory') {
      window.location.hash = `/subcategory/${to.categoryId}/${to.subId}`;
    } else if (to.page === 'file') {
      const h = encodePathToHash(to.path || '');
      window.location.hash = `/file/${h}`;
    }
    // route will update via hashchange event
  };

  return { route, navigate };
}

function Sidebar({ data, onNavigate, onOpenFile }) {
  // data: { index, expanded } shape returned by /api/github
  return (
    <div style={{ padding: 12 }}>
      <h3>เนื้อหา (Content DB)</h3>
      {!data && <div>กำลังโหลด...</div>}
      {data && data.index && Array.isArray(data.index.categories) && (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {data.index.categories.map(cat => {
            const catPath = cat.file && (cat.file.startsWith('/') ? cat.file : `/assets/db/con-data/${cat.file}`);
            const label = (cat.name && (cat.name.th || cat.name.en)) || cat.id;
            return (
              <li key={cat.id} style={{ marginBottom: 8 }}>
                <div>
                  <button onClick={() => onNavigate({ page: 'category', id: cat.id })} style={{ fontWeight: '600' }}>
                    {label}
                  </button>
                </div>
                <div style={{ marginLeft: 8, marginTop: 6 }}>
                  {/* show subcategories if expanded available */}
                  {data.expanded && Array.isArray(data.expanded) && (() => {
                    const ex = data.expanded.find(e => e.meta && e.meta.id === cat.id);
                    if (!ex || !ex.meta) return null;
                    if (!Array.isArray(ex.meta.categories)) return null;
                    return (
                      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                        {ex.meta.categories.map(sc => (
                          <li key={sc.id}>
                            <button onClick={() => onNavigate({ page: 'subcategory', categoryId: cat.id, subId: sc.id })} style={{ fontSize: 13 }}>
                              {(sc.name && (sc.name.th || sc.name.en)) || sc.id}
                            </button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => onOpenFile(catPath)} style={{ fontSize: 12 }}>เปิดไฟล์หมวด (raw)</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Breadcrumbs({ route, onNavigate }) {
  const crumbs = [];
  crumbs.push({ label: 'Home', action: () => onNavigate({ page: 'home' }) });
  if (route.page === 'category') {
    crumbs.push({ label: `Category: ${route.id}`, action: null });
  } else if (route.page === 'subcategory') {
    crumbs.push({ label: `Category: ${route.categoryId}`, action: () => onNavigate({ page: 'category', id: route.categoryId }) });
    crumbs.push({ label: `Sub: ${route.subId}`, action: null });
  } else if (route.page === 'file') {
    crumbs.push({ label: 'File', action: null });
  }
  return (
    <div style={{ marginBottom: 12 }}>
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {c.action ? <button onClick={c.action} style={{ background: 'none', border: 'none', color: '#0366d6', cursor: 'pointer' }}>{c.label}</button> : <span>{c.label}</span>}
        </span>
      ))}
    </div>
  );
}

export default function Page() {
  const { route, navigate } = useHashRoute();

  const [db, setDb] = useState(null); // { index, expanded }
  const [selectedRaw, setSelectedRaw] = useState(null); // { path, content }
  const [loading, setLoading] = useState(false);

  // AI-related state
  const [selected, setSelected] = useState(null); // for AI context (keeps compatibility)
  const [prompt, setPrompt] = useState('');
  const [aiText, setAiText] = useState('');
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);

  // Load expanded index at startup
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/github')
      .then(r => r.json())
      .then(d => {
        if (!mounted) return;
        setDb(d);
        setLoading(false);
      }).catch(err => {
        console.error('load index error', err);
        setDb(null);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // When route changes to a file, fetch that file raw
  useEffect(() => {
    if (route.page === 'file' && route.path) {
      (async () => {
        setSelectedRaw({ path: route.path, content: 'กำลังโหลด...' });
        try {
          const r = await fetch('/api/github?path=' + encodeURIComponent(route.path));
          const j = await r.json();
          if (j.contents && j.contents.content) {
            const raw = atob(j.contents.content);
            setSelectedRaw({ path: route.path, content: raw });
          } else {
            setSelectedRaw({ path: route.path, content: JSON.stringify(j, null, 2) });
          }
        } catch (e) {
          setSelectedRaw({ path: route.path, content: 'Error: ' + (e.message || String(e)) });
        }
      })();
    } else {
      setSelectedRaw(null);
    }
  }, [route]);

  const openFile = useCallback((path) => {
    navigate({ page: 'file', path });
  }, [navigate]);

  // Convenience: find expanded data for category / subcategory
  const findCategoryExpanded = (catId) => {
    if (!db || !db.expanded) return null;
    return db.expanded.find(e => e.meta && e.meta.id === catId) || null;
  };

  const findSubcategoryContent = (categoryId, subId) => {
    const cat = findCategoryExpanded(categoryId);
    if (!cat) return null;
    // subcategories meta may be in cat.meta.categories or cat.subcategories array depending on API shape
    // prefer parsed content: cat.subcategories (from earlier expand)
    if (Array.isArray(cat.subcategories)) {
      const found = cat.subcategories.find(s => s.meta && s.meta.id === subId);
      if (found && found.content) return found.content;
    }
    // fallback to meta entries
    if (Array.isArray(cat.meta && cat.meta.categories)) {
      const meta = cat.meta.categories.find(s => s.id === subId);
      if (meta && meta.file) {
        // try to find parsed content in cat.content or request on demand (but avoid extra request here)
        // if cat.content contains nested, try to find it
        if (cat.content && Array.isArray(cat.content.data)) {
          // not applicable — leave
        }
      }
    }
    return null;
  };

  // AI functions (unchanged behaviour)
  async function askAI() {
    setAiText('...');
    const r = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, fileContent: selectedRaw?.content || selected?.content || '' })
    });
    const j = await r.json();
    if (j.aiText) setAiText(j.aiText);
    else setAiText('No response');
  }

  function previewActions() {
    setPreview(aiText);
  }

  async function execute() {
    setExecuting(true);
    const r = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionText: preview || aiText, actor: 'web-ui' })
    });
    const j = await r.json();
    setExecuting(false);
    if (j.ok) {
      alert('Executed: ' + JSON.stringify(j.results));
      // after modifications, reload index to reflect changes
      try {
        const rr = await fetch('/api/github');
        const dd = await rr.json();
        setDb(dd);
      } catch (e) { /* ignore reload error */ }
    } else {
      alert('Error: ' + j.error);
    }
  }

  // Render main content based on route
  function MainContent() {
    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    if (route.page === 'home') {
      return (
        <div>
          <h2>หน้าแรก — หมวดหมู่ทั้งหมด</h2>
          <p>เลือกหมวดจากแถบด้านซ้ายเพื่อดูรายละเอียด</p>
          {!db && <div>ไม่พบข้อมูล</div>}
          {db && db.index && (
            <div>
              <h4>Categories</h4>
              <ul>
                {db.index.categories.map(c => (
                  <li key={c.id}>
                    <button onClick={() => navigate({ page: 'category', id: c.id })}>
                      {(c.name && (c.name.th || c.name.en)) || c.id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (route.page === 'category') {
      const catId = route.id;
      const ex = findCategoryExpanded(catId);
      const meta = (db && db.index && Array.isArray(db.index.categories) && db.index.categories.find(cc => cc.id === catId)) || (ex && ex.meta) || null;
      const content = ex && ex.content;
      const subsMeta = (ex && Array.isArray(ex.meta && ex.meta.categories) && ex.meta.categories) || (ex && Array.isArray(ex.subcategories) && ex.subcategories.map(s => s.meta)) || [];

      return (
        <div>
          <Breadcrumbs route={route} onNavigate={navigate} />
          <h2>{(meta && (meta.name && (meta.name.th || meta.name.en))) || catId}</h2>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => navigate({ page: 'home' })}>กลับไปหน้าแรก</button>
            <button onClick={() => openFile(ex && ex.meta && (ex.meta.file && (ex.meta.file.startsWith('/') ? ex.meta.file : `/assets/db/con-data/${ex.meta.file}`)))} style={{ marginLeft: 8 }}>
              เปิดไฟล์หมวด (raw)
            </button>
          </div>
          <div>
            <h3>หมวดย่อย</h3>
            {subsMeta && subsMeta.length > 0 ? (
              <ul>
                {subsMeta.map(s => (
                  <li key={s.id}>
                    <button onClick={() => navigate({ page: 'subcategory', categoryId: catId, subId: s.id })}>
                      {(s.name && (s.name.th || s.name.en)) || s.id}
                    </button>
                    <button onClick={() => {
                      const scPath = s.file && (s.file.startsWith('/') ? s.file : `/assets/db/con-data/${s.file}`);
                      if (scPath) openFile(scPath);
                    }} style={{ marginLeft: 8 }}>
                      raw
                    </button>
                  </li>
                ))}
              </ul>
            ) : <div>ไม่มีหมวดย่อย</div>}
            <h3>ข้อมูล (parsed)</h3>
            {content ? <pre style={{ background: '#f5f5f5', padding: 8 }}>{JSON.stringify(content, null, 2)}</pre> : <div>ไม่มีเนื้อหา parsed ของหมวดนี้</div>}
          </div>
        </div>
      );
    }

    if (route.page === 'subcategory') {
      const { categoryId, subId } = route;
      const subContent = findSubcategoryContent(categoryId, subId);
      return (
        <div>
          <Breadcrumbs route={route} onNavigate={navigate} />
          <h2>หมวดย่อย: {subId}</h2>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => navigate({ page: 'category', id: categoryId })}>กลับไปหมวด {categoryId}</button>
          </div>
          <div>
            <h3>ข้อมูลรายการ</h3>
            {subContent ? (
              <div>
                <pre style={{ background: '#f5f5f5', padding: 8 }}>{JSON.stringify(subContent, null, 2)}</pre>
                {/* Allow opening raw file if meta exists */}
                {subContent.id && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => {
                      // try to find file path from db.expanded
                      const cat = findCategoryExpanded(categoryId);
                      if (cat && Array.isArray(cat.subcategories)) {
                        const s = cat.subcategories.find(x => x.meta && x.meta.id === subId);
                        const meta = s && s.meta;
                        const p = meta && meta.file;
                        const path = p && (p.startsWith('/') ? p : `/assets/db/con-data/${p}`);
                        if (path) openFile(path);
                      }
                    }}>เปิดไฟล์หมวดย่อย (raw)</button>
                  </div>
                )}
              </div>
            ) : <div>เนื้อหาหมวดย่อยยังไม่มี (parsed) — ถ้าต้องการสามารถคลิก raw เพื่อดึงไฟล์</div>}
          </div>
        </div>
      );
    }

    if (route.page === 'file') {
      return (
        <div>
          <Breadcrumbs route={route} onNavigate={navigate} />
          <h2>ไฟล์: {selectedRaw ? selectedRaw.path : ''}</h2>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => navigate({ page: 'home' })}>กลับหน้าแรก</button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 200 }}>
            {selectedRaw ? selectedRaw.content : 'กำลังโหลด...'}
          </div>
        </div>
      );
    }

    return <div>ไม่พบหน้า</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Fantrove CMS — SPA (ภาษาไทย)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 360, borderRight: '1px solid #eee' }}>
          <Sidebar data={db} onNavigate={navigate} onOpenFile={(p) => openFile(p)} />
        </div>

        <div style={{ flex: 1 }}>
          <MainContent />

          <hr />

          <div style={{ marginTop: 12 }}>
            <h3>AI Content Planner</h3>
            <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, minHeight: 120, marginBottom: 8 }}>
              {selectedRaw ? selectedRaw.content : selected ? selected.content : 'ยังไม่ได้เลือกไฟล์ (context)'}
            </div>

            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} style={{ width: '100%', height: 120 }} placeholder="พิมพ์คำสั่งเป็นภาษาไทย ..." />

            <div style={{ marginTop: 8 }}>
              <button onClick={askAI} disabled={!prompt}>ส่งให้ AI (OpenRouter)</button>
              <button onClick={previewActions} disabled={!aiText}>ดูตัวอย่าง Action</button>
              <button onClick={execute} disabled={!aiText || executing}>{executing ? 'กำลังทำ...' : 'ยืนยันและ Execute'}</button>
            </div>

            <h4 style={{ marginTop: 12 }}>AI Action List (Preview)</h4>
            <div style={{ whiteSpace: 'pre-wrap', background: '#fffbe6', padding: 10, minHeight: 120 }}>{aiText || 'ยังไม่มี'}</div>
          </div>
        </div>
      </div>

      <hr />
      <p style={{ color: '#666' }}>
        หมายเหตุ: SPA นี้ใช้ URL hash เพื่อแยกหน้าจอภายในหน้าเดียว — สามารถใช้ back/forward ของเบราว์เซอร์ได้
      </p>
    </div>
  );
}