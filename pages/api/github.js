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
    
    // If asking for root con-data, expand index.json and follow pointers to category files and subcategory files
    const rootNormalized = gitPath.replace(/\/+$/, '');
    if (!path || rootNormalized === '/assets/db/con-data') {
      // read index.json
      const idxContents = await getContents('/assets/db/con-data/index.json');
      if (!idxContents) return res.status(404).json({ error: 'index.json not found' });
      const indexJson = decodeContent(idxContents);
      if (!indexJson) return res.status(500).json({ error: 'Failed to parse index.json' });
      
      const expanded = [];
      for (const cat of indexJson.categories || []) {
        // Resolve category file path (support both "emoji.min.json" and "/assets/db/con-data/emoji.min.json")
        const catFile = (cat.file && String(cat.file)) || '';
        const catPath = catFile.startsWith('/') ? catFile : `/assets/db/con-data/${catFile}`;
        const catContents = await getContents(catPath);
        const catJson = decodeContent(catContents) || null;
        
        const subcategories = [];
        if (catJson && Array.isArray(catJson.categories)) {
          for (const sc of catJson.categories) {
            const scFile = (sc.file && String(sc.file)) || '';
            const scPath = scFile.startsWith('/') ? scFile : `/assets/db/con-data/${scFile}`;
            const scContents = await getContents(scPath);
            const scJson = decodeContent(scContents) || null;
            subcategories.push({ meta: sc, content: scJson });
          }
        }
        
        expanded.push({ meta: cat, content: catJson, subcategories });
      }
      
      return res.status(200).json({ index: indexJson, expanded });
    }
    
    // Otherwise just proxy to getContents for the requested path
    const contents = await getContents(gitPath);
    return res.status(200).json({ contents });
  } catch (err) {
    console.error('github api error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}