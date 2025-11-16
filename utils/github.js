import { Octokit } from '@octokit/rest';

let octokit;

const initOctokit = () => {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is not set');
    }
    octokit = new Octokit({
      auth: token,
    });
  }
  return octokit;
};

const OWNER = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'fantrove';
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'fantrove-data';

export const githubApi = {
  /**
   * Get file or directory content
   */
  async getContent(path = '') {
    try {
      const octokit = initOctokit();
      const response = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: path || '',
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API Error (getContent):', error.message);
      throw new Error(`Failed to get content: ${error.message}`);
    }
  },
  
  /**
   * Create or update file
   */
  async createOrUpdateFile(path, content, message, sha = null) {
    try {
      const octokit = initOctokit();
      
      // Validate inputs
      if (!path || path.trim() === '') {
        throw new Error('Path cannot be empty');
      }
      
      const response = await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path,
        message: message || `Update ${path}`,
        content: Buffer.from(content).toString('base64'),
        ...(sha && { sha }),
        committer: {
          name: 'Fantrove Bot',
          email: 'bot@fantrove.io',
        },
        author: {
          name: 'Fantrove Bot',
          email: 'bot@fantrove.io',
        },
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API Error (createOrUpdateFile):', error.message);
      throw new Error(`Failed to create/update file: ${error.message}`);
    }
  },
  
  /**
   * Delete file
   */
  async deleteFile(path, sha, message = null) {
    try {
      const octokit = initOctokit();
      
      if (!path || path.trim() === '') {
        throw new Error('Path cannot be empty');
      }
      
      const response = await octokit.repos.deleteFile({
        owner: OWNER,
        repo: REPO,
        path,
        message: message || `Delete ${path}`,
        sha,
        committer: {
          name: 'Fantrove Bot',
          email: 'bot@fantrove.io',
        },
        author: {
          name: 'Fantrove Bot',
          email: 'bot@fantrove.io',
        },
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API Error (deleteFile):', error.message);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },
  
  /**
   * List directory contents
   */
  async listDirectory(path = '') {
    try {
      const octokit = initOctokit();
      const response = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: path || '',
      });
      
      const data = Array.isArray(response.data) ? response.data : [response.data];
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        download_url: item.download_url,
      }));
    } catch (error) {
      console.error('GitHub API Error (listDirectory):', error.message);
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  },
  
  /**
   * Get file with encoding decode
   */
  async getFileContent(path) {
    try {
      const octokit = initOctokit();
      const response = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
      });
      
      if (response.data.type === 'file') {
        return {
          content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
          sha: response.data.sha,
          size: response.data.size,
          path: response.data.path,
        };
      }
      throw new Error('Path is not a file');
    } catch (error) {
      console.error('GitHub API Error (getFileContent):', error.message);
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  },
  
  /**
   * Get repository info
   */
  async getRepoInfo() {
    try {
      const octokit = initOctokit();
      const response = await octokit.repos.get({
        owner: OWNER,
        repo: REPO,
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API Error (getRepoInfo):', error.message);
      throw new Error(`Failed to get repo info: ${error.message}`);
    }
  },
};