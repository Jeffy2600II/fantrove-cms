// lib/core/scopeGuard.js
// Enforce write/read scope: only allow paths under /assets/db/con-data/
const path = require('path');

const ALLOWED_BASE = '/assets/db/con-data/';

function normalizeGitPath(p) {
  // GitHub content API uses paths without leading slash
  if (!p) return '';
  return p.replace(/^\/+/, '');
}

function isPathAllowed(gitPath) {
  const normalized = '/' + normalizeGitPath(gitPath);
  const base = ALLOWED_BASE.replace(/\/+$/, '/');
  return normalized.startsWith(base);
}

function enforcePath(gitPath) {
  if (!isPathAllowed(gitPath)) {
    const err = new Error(`Path not allowed: ${gitPath}. Writes/reads must be inside ${ALLOWED_BASE}`);
    err.code = 'SCOPE_VIOLATION';
    throw err;
  }
}

module.exports = { ALLOWED_BASE, normalizeGitPath, isPathAllowed, enforcePath };