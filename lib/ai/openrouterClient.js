// lib/ai/openrouterClient.js
// Proxy small helper to call OpenRouter (server-side).
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) console.warn('OPENROUTER_API_KEY not set');

async function callOpenRouter(prompt, system = 'You are a content planner. Return ACTION LIST in Thai, plain text.') {
  // NOTE: design request minimal; you should configure model & params in production
  const url = 'https://api.openrouter.ai/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini', // replace with available model on OpenRouter account
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  };
  const res = await fetch(url, {
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
  // Attempt to retrieve text from response
  const msg = (json?.choices?.[0]?.message?.content) || (json?.choices?.[0]?.text) || '';
  return msg;
}

module.exports = { callOpenRouter };