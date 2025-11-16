import { githubApi } from '../../../utils/github';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { path, sha } = req.body;
    
    if (!path || !sha) {
      return res.status(400).json({ error: 'Path and SHA are required' });
    }
    
    await githubApi.deleteFile(path, sha);
    
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, message: `${path} deleted` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}