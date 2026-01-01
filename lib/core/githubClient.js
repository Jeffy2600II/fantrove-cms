// lib/core/githubClient.js
// Minimal GitHub Content API client using node fetch (native fetch on Node 18+)
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const b64 = (str) => Buffer.from(str, 'utf8').toString('base64');

const { normalizeGitPath, enforcePath } = require('./scopeGuard');

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;

if (!OWNER || !REPO) {
  console.warn('GITHUB_OWNER or GITHUB_REPO not set in env — githubClient may fail');
}

function apiUrl(path) {
  return `https://api.github.com${path}`;
}

async function getContents(path) {
  // GET /repos/{owner}/{repo}/contents/{path}
  enforcePath(path);
  const p = normalizeGitPath(path);
  const url = apiUrl(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(p)}?ref=${BRANCH}`);
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json'
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub getContents error ${res.status}: ${txt}`);
  }
  return res.json();
}

async function putContents(path, contentUtf8, message, sha = null) {
  enforcePath(path);
  const p = normalizeGitPath(path);
  const url = apiUrl(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(p)}`);
  const body = {
    message,
    content: b64(contentUtf8),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GitHub putContents error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = { getContents, putContents };