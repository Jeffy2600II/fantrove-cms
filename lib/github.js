import { Octokit } from '@octokit/rest';

let octokit;
function initOctokit() {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      // If token not provided, keep octokit undefined (APIs will error)
      octokit = null;
    } else {
      octokit = new Octokit({ auth: token });
    }
  }
  return octokit;
}

const OWNER = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || process.env.GITHUB_REPO_OWNER || 'fantrove';
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || process.env.GITHUB_REPO_NAME || 'fantrove-data';

export async function listDirectory(path = '') {
  const client = initOctokit();
  if (!client) throw new Error('GITHUB_TOKEN not configured');
  const res = await client.repos.getContent({ owner: OWNER, repo: REPO, path: path || '' });
  const data = Array.isArray(res.data) ? res.data : [res.data];
  return data.map(item => ({
    name: item.name, path: item.path, type: item.type, size: item.size, sha: item.sha, download_url: item.download_url
  }));
}

export async function getFileContent(path) {
  const client = initOctokit();
  if (!client) throw new Error('GITHUB_TOKEN not configured');
  const res = await client.repos.getContent({ owner: OWNER, repo: REPO, path });
  if (res.data.type !== 'file') throw new Error('Not a file');
  return {
    content: Buffer.from(res.data.content, 'base64').toString('utf-8'),
    sha: res.data.sha,
    size: res.data.size,
    path: res.data.path,
  };
}

export async function createOrUpdateFile(path, content, message = 'Update file', sha = undefined) {
  const client = initOctokit();
  if (!client) throw new Error('GITHUB_TOKEN not configured');
  const res = await client.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
    committer: { name: 'Fantrove Bot', email: 'bot@fantrove.io' },
    author: { name: 'Fantrove Bot', email: 'bot@fantrove.io' },
  });
  return res.data;
}

export async function deleteFile(path, sha, message = `Delete ${path}`) {
  const client = initOctokit();
  if (!client) throw new Error('GITHUB_TOKEN not configured');
  const res = await client.repos.deleteFile({ owner: OWNER, repo: REPO, path, sha, message, committer: { name: 'Fantrove Bot', email: 'bot@fantrove.io' }, author: { name: 'Fantrove Bot', email: 'bot@fantrove.io' } });
  return res.data;
}