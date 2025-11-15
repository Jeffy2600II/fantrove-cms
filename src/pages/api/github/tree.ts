import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepoTree } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const files = await getRepoTree();
    res.status(200).json({ files });
  } catch (err:any) {
    res.status(500).json({ message: err.message || 'Failed to fetch repo tree' });
  }
}