// pages/api/github.js
// small wrapper to list and read files inside /assets/db/con-data. Only GET allowed here.
import { getContents } from '../../lib/core/githubClient';

function decodeContent(contentsObj) {
  if (!contentsObj || !contentsObj.content) return null;
  try {
    return JSON.parse(Buffer.from(contentsObj.content, contentsObj.encoding).toString('utf8'));
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { path } = req.query;
    // default path is folder root of content DB
    const gitPath = path ? String(path) : '/assets/db/con-data';
    
    // If asking for root con-data, expand index.json and follow pointers to category files,
    // but DO NOT include full file contents of subcategory files — only meta (id,name,file).
    const rootNormalized = gitPath.replace(/\/+$/, '');
    if (!path || rootNormalized === '/assets/db/con-data') {
      const idxContents = await getContents('/assets/db/con-data/index.json');
      if (!idxContents) return res.status(404).json({ error: 'index.json not found' });
      const indexJson = decodeContent(idxContents);
      if (!indexJson) return res.status(500).json({ error: 'Failed to parse index.json' });
      
      const expanded = [];
      for (const catMeta of indexJson.categories || []) {
        const catFileField = (catMeta.file && String(catMeta.file)) || '';
        const catPath = catFileField.startsWith('/') ? catFileField : `/assets/db/con-data/${catFileField}`;
        const catContents = await getContents(catPath);
        const catJson = decodeContent(catContents) || null;
        
        // Build category object with meta and subcategory meta only (no sub-file content)
        const subcategoryMetas = [];
        if (catJson && Array.isArray(catJson.categories)) {
          for (const sc of catJson.categories) {
            // keep only id, name, file info for listing
            subcategoryMetas.push({
              id: sc.id,
              name: sc.name,
              file: sc.file
            });
          }
        }
        
        expanded.push({
          meta: {
            id: catMeta.id,
            name: catMeta.name,
            file: catMeta.file
          },
          path: catPath,
          hasDirectData: !!(catJson && Array.isArray(catJson.data) && catJson.data.length > 0),
          subcategories: subcategoryMetas
        });
      }
      
      return res.status(200).json({ index: indexJson, expanded });
    }
    
    // Otherwise proxy to getContents for requested path (this will return full file content
    // so the UI can request a specific file on-demand via ?path=...)
    const contents = await getContents(gitPath);
    return res.status(200).json({ contents });
  } catch (err) {
    console.error('github api error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}