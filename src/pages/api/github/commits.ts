import type { NextApiRequest, NextApiResponse } from 'next';
import { listCommitsForPath } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = (req.query.path as string);
  if (!path) return res.status(400).json({ message: 'path required' });
  try {
    const commits = await listCommitsForPath(path);
    res.status(200).json(commits);
  } catch (err:any) {
    res.status(500).json({ message: err.message || 'Failed to get commits' });
  }
}