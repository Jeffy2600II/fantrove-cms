// pages/api/execute.js
// Endpoint to execute action list (parse, validate, modify files, commit)
import { executeActions } from '../../lib/cms/executor';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { actionText, actor } = req.body || {};
    if (!actionText) return res.status(400).json({ error: 'actionText required' });
    const results = await executeActions(actionText, actor || 'web-user');
    return res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error('execute error', err);
    return res.status(400).json({ error: err.message || String(err) });
  }
}