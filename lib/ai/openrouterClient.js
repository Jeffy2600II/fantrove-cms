// lib/ai/openrouterClient.js
// Use global fetch (Node 18+/24+ on Vercel). If fetch not available, throw informative error.
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) console.warn('OPENROUTER_API_KEY not set');

function ensureFetchAvailable() {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error(
      'Global fetch is not available in this runtime. ' +
      'For local development on Node <18, install node-fetch as a devDependency: ' +
      '`npm install --save-dev node-fetch`'
    );
  }
}

async function callOpenRouter(prompt, system = 'You are a content planner. Return ACTION LIST in Thai, plain text.') {
  ensureFetchAvailable();
  const url = 'https://api.openrouter.ai/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  };
  const res = await globalThis.fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${txt}`);
  }
  const json = await res.json();
  const msg = (json?.choices?.[0]?.message?.content) || (json?.choices?.[0]?.text) || '';
  return msg;
}

module.exports = { callOpenRouter };