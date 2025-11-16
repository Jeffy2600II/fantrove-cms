import { githubApi } from '../../../utils/github';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { path } = req.query;
    const items = await githubApi.listDirectory(path || '');
    
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(items);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}