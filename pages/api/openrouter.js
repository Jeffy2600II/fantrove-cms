// pages/api/openrouter.js
// Proxy endpoint: receives { prompt, fileContent } and returns AI "action list" text
import { callOpenRouter } from '../../lib/ai/openrouterClient';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { prompt, fileContent } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    // Assemble system prompt for OpenRouter: include file content context and strict instruction to return ACTION LIST only
    const system = `You are a Content Planner for a file-based CMS. The user will send a prompt in Thai and optionally a JSON file content for context. IMPORTANT: You MUST NOT return JSON or code. Return ACTION LIST in Thai only. Use the exact ACTION LIST format:
ACTION LIST:
1. <action title>
   - ระดับ: category|subcategory|data
   - id: ...
   - ชื่อ: ...
   - อยู่ภายใต้: <category id>   (if subcategory)
   - subcategory: <name>         (if data)
   - จำนวน: <number>             (if data)
   - แนวทาง: <guideline>
Only return actions. Do not add fields. Do not guess paths.`;
    
    const combinedPrompt = `User prompt:\n${prompt}\n\nContext file (truncated):\n${fileContent ? fileContent.slice(0, 2000) : 'none'}`;
    
    const aiText = await callOpenRouter(combinedPrompt, system);
    return res.status(200).json({ aiText });
  } catch (err) {
    console.error('openrouter proxy error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}