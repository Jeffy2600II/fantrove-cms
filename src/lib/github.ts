/**
 * src/lib/github.ts
 * Lightweight GitHub REST helper for server-side Next.js API routes.
 *
 * - Uses global fetch (Node 18+ / Vercel runtime provides fetch).
 * - Reads env variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 * - Exports: getRepoTree, getFileContent, listCommitsForPath, putFileContent
 *
 * Note: Keep GITHUB_TOKEN secret (set in Vercel/ENV, not committed).
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = process.env.GITHUB_OWNER || 'fantrove';
const REPO = process.env.GITHUB_REPO || 'fantrove-data';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const API_BASE = 'https://api.github.com';

function headers() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json'
  };
  if (GITHUB_TOKEN) {
    h.Authorization = `token ${GITHUB_TOKEN}`;
  }
  return h;
}

async function ghFetch(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...headers()
    }
  });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = parsed && parsed.message ? parsed.message : `GitHub API error: ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return parsed ?? text;
}

/**
 * Get repo tree (list files) for BRANCH.
 * Returns array of { path, size, sha }
 */
export async function getRepoTree(): Promise<Array<{ path: string; size?: number; sha?: string }>> {
  // Get branch commit sha
  const branchUrl = `${API_BASE}/repos/${OWNER}/${REPO}/branches/${encodeURIComponent(BRANCH)}`;
  const branchJson = await ghFetch(branchUrl);
  const commitSha = branchJson?.commit?.commit?.tree?.sha || branchJson?.commit?.commit?.sha || branchJson?.commit?.sha;
  if (!commitSha) {
    // Fallback: query default branch via repo
    const repoUrl = `${API_BASE}/repos/${OWNER}/${REPO}`;
    const repoJson = await ghFetch(repoUrl);
    const defaultBranch = repoJson?.default_branch || BRANCH;
    const branchUrl2 = `${API_BASE}/repos/${OWNER}/${REPO}/branches/${encodeURIComponent(defaultBranch)}`;
    const branchJson2 = await ghFetch(branchUrl2);
    const commitSha2 = branchJson2?.commit?.commit?.tree?.sha || branchJson2?.commit?.sha;
    if (!commitSha2) throw new Error('Unable to determine tree SHA for repository');
    // continue with commitSha2
    const treeUrl = `${API_BASE}/repos/${OWNER}/${REPO}/git/trees/${commitSha2}?recursive=1`;
    const treeJson = await ghFetch(treeUrl);
    return (treeJson.tree || []).filter((t: any) => t.type === 'blob').map((t: any) => ({ path: t.path, size: t.size, sha: t.sha }));
  }
  const treeUrl = `${API_BASE}/repos/${OWNER}/${REPO}/git/trees/${commitSha}?recursive=1`;
  const treeJson = await ghFetch(treeUrl);
  const files = (treeJson.tree || []).filter((t: any) => t.type === 'blob').map((t: any) => ({ path: t.path, size: t.size, sha: t.sha }));
  return files;
}

/**
 * Get file content as parsed JSON when possible, otherwise as raw text.
 * Throws on 404 with status 404.
 */
export async function getFileContent(path: string): Promise<any> {
  const url = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`;
  const json = await ghFetch(url);
  if (!json || typeof json !== 'object') throw new Error('Unexpected response from GitHub contents API');
  if (!json.content) return '';
  const buff = Buffer.from(json.content, 'base64').toString('utf8');
  try {
    return JSON.parse(buff);
  } catch {
    return buff;
  }
}

/**
 * List commits for a path (up to 50)
 */
export async function listCommitsForPath(path: string): Promise<any[]> {
  const url = `${API_BASE}/repos/${OWNER}/${REPO}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(BRANCH)}&per_page=50`;
  const commits = await ghFetch(url);
  return Array.isArray(commits) ? commits : [];
}

/**
 * Create or update a file content. content is raw string (utf8).
 * Returns GitHub API response for commit.
 */
export async function putFileContent(path: string, content: string, message: string) {
  // Try to get existing file to obtain sha
  const getUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`;
  let sha: string | undefined;
  try {
    const existing = await ghFetch(getUrl);
    sha = existing?.sha;
  } catch (err: any) {
    // if 404, we'll create new file (sha remains undefined)
    if (err && err.status && err.status !== 404) {
      throw err;
    }
  }

  const body = {
    message: message || `Update ${path}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: BRANCH,
    sha
  };

  const putUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
  const res = await ghFetch(putUrl, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res;
}

/**
 * Small helper: check if token present
 */
export function hasToken(): boolean {
  return !!GITHUB_TOKEN;
}

export default {
  getRepoTree,
  getFileContent,
  listCommitsForPath,
  putFileContent,
  hasToken
};