// Simple fetch wrapper for client-side usage
const base = process.env.NEXT_PUBLIC_API_URL || '';

async function request(path, opts = {}) {
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || text);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

export const apiGet = (path) => request(path, { method: 'GET' });
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPatch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = (path, body) => request(path, { method: 'DELETE', body: JSON.stringify(body) });