import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.DATA_REPO_OWNER!;
const repo = process.env.DATA_REPO_NAME!;
const branch = process.env.DATA_REPO_BRANCH!;

export async function listFiles(path: string = "") {
  const res = await octokit.repos.getContent({ owner, repo, path, ref: branch });
  return Array.isArray(res.data) ? res.data : [res.data];
}

export async function getFileContent(path: string) {
  const res = await octokit.repos.getContent({ owner, repo, path, ref: branch });
  if ("content" in res.data) {
    const buff = Buffer.from(res.data.content, "base64").toString("utf8");
    return { ...res.data, decoded: buff };
  }
  return res.data;
}

export async function commitFile(path: string, content: string, sha: string, message: string) {
  const buff = Buffer.from(content, "utf8").toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: buff,
    sha,
    branch,
    committer: { name: "Fantrove CMS", email: "noreply@fantrove.com" },
    author: { name: "Fantrove CMS", email: "noreply@fantrove.com" }
  });
}

export async function createFile(path: string, content: string, message: string) {
  const buff = Buffer.from(content, "utf8").toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: buff,
    branch,
    committer: { name: "Fantrove CMS", email: "noreply@fantrove.com" },
    author: { name: "Fantrove CMS", email: "noreply@fantrove.com" }
  });
}

export async function deleteFile(path: string, sha: string, message: string) {
  await octokit.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha,
    branch,
    committer: { name: "Fantrove CMS", email: "noreply@fantrove.com" },
    author: { name: "Fantrove CMS", email: "noreply@fantrove.com" }
  });
}