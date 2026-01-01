// pages/api/github.js
// small wrapper to list and read files inside /assets/db/con-data. Only GET allowed here.
import { getContents } from '../../lib/core/githubClient';

function decodeJson(contentsObj) {
  if (!contentsObj || !contentsObj.content) return null;
  try {
    return JSON.parse(Buffer.from(contentsObj.content, contentsObj.encoding).toString('utf8'));
  } catch (e) {
    return null;
  }
}

function resolvePath(fileRef) {
  if (!fileRef) return null;
  const s = String(fileRef);
  return s.startsWith('/') ? s : `/assets/db/con-data/${s}`.replace(/\/\/+/g, '/');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { path } = req.query;
    // default path is folder root of content DB
    const gitPath = path ? String(path) : '/assets/db/con-data';
    
    // When requesting root, return index + expanded tree (metadata only, no file "data")
    const rootNormalized = gitPath.replace(/\/+$/, '');
    if (!path || rootNormalized === '/assets/db/con-data') {
      // read index.json
      const idxContents = await getContents('/assets/db/con-data/index.json');
      if (!idxContents) return res.status(404).json({ error: 'index.json not found' });
      const indexJson = decodeJson(idxContents);
      if (!indexJson) return res.status(500).json({ error: 'Failed to parse index.json' });
      
      const tree = [];
      for (const cat of indexJson.categories || []) {
        const catFileRef = cat.file || '';
        const catPath = resolvePath(catFileRef);
        // Try to read the category file to obtain its metadata (but we will NOT include its data array)
        let catJson = null;
        try {
          const catContents = await getContents(catPath);
          catJson = decodeJson(catContents);
        } catch (e) {
          catJson = null;
        }
        
        const catNode = {
          id: cat.id,
          name: cat.name,
          file: catFileRef,
          path: catPath,
          hasData: !!(catJson && Array.isArray(catJson.data) && catJson.data.length > 0),
          dataCount: catJson && Array.isArray(catJson.data) ? catJson.data.length : 0,
          subcategories: []
        };
        
        // If category file declares subcategories (meta), include their meta and resolved path only (no file content)
        if (catJson && Array.isArray(catJson.categories)) {
          for (const sc of catJson.categories) {
            const scFileRef = sc.file || '';
            const scPath = resolvePath(scFileRef);
            catNode.subcategories.push({
              id: sc.id,
              name: sc.name,
              file: scFileRef,
              path: scPath
              // intentionally do NOT include sc.content or sc.data — user requested no inline content
            });
          }
        }
        
        tree.push(catNode);
      }
      
      return res.status(200).json({ index: indexJson, tree });
    }
    
    // Otherwise proxy the raw GitHub contents for the requested path.
    // This branch is used when frontend explicitly asks for file contents (e.g., "ดูเนื้อหา")
    const contents = await getContents(gitPath);
    return res.status(200).json({ contents });
  } catch (err) {
    console.error('github api error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}