// lib/ai/openrouterClient.js
// Safe fetch: use global fetch (Node 18+) or dynamic-import node-fetch at runtime
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) console.warn('OPENROUTER_API_KEY not set');

async function safeFetch(...args) {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(...args);
  }
  // dynamic import node-fetch as fallback (only when needed at runtime)
  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch(...args);
}

async function callOpenRouter(prompt, system = 'You are a content planner. Return ACTION LIST in Thai, plain text.') {
  const url = 'https://api.openrouter.ai/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  };
  const res = await safeFetch(url, {
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