/** Next.js config minimal */
module.exports = {
  reactStrictMode: true,
  env: {
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main'
  }
};