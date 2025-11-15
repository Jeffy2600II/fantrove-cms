import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileContent } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = (req.query.path as string) || req.body?.path;
  if (!path) return res.status(400).json({ message: 'path required' });
  try {
    const content = await getFileContent(path);
    res.status(200).json({ content });
  } catch (err:any) {
    res.status(err?.status || 500).json({ message: err.message || 'Failed to fetch content' });
  }
}