// pages/api/github.js
// small wrapper to list and read files inside /assets/db/con-data. Only GET allowed here.
import { getContents } from '../../lib/core/githubClient';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { path } = req.query;
    // default path is folder root of content DB
    const gitPath = path ? String(path) : '/assets/db/con-data';
    const contents = await getContents(gitPath);
    return res.status(200).json({ contents });
  } catch (err) {
    console.error('github api error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}