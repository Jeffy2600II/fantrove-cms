import { githubApi } from '../../../utils/github';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { path, content, message, sha } = req.body;
    
    // Validate inputs
    if (!path || !content) {
      return res.status(400).json({ error: 'Path and content are required' });
    }
    
    if (content.length > 100 * 1024 * 1024) {
      return res.status(413).json({ error: 'File is too large (max 100MB)' });
    }
    
    const result = await githubApi.createOrUpdateFile(
      path,
      content,
      message || `Update ${path}`,
      sha
    );
    
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}