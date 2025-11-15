import type { NextApiRequest, NextApiResponse } from 'next';
import { putFileContent } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { path, content, message } = req.body || {};
  if (!path || typeof content !== 'string' || !message) return res.status(400).json({ message: 'path, content, message required' });

  try {
    const result = await putFileContent(path, content, message);
    res.status(200).json(result);
  } catch (err:any) {
    res.status(err?.status || 500).json({ message: err.message || 'Commit failed' });
  }
}