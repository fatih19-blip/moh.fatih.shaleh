import { githubTokenConfigured, githubConfig, sendJson } from '../server-lib.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  const config = githubConfig();
  return sendJson(res, 200, {
    ok: true,
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    githubTokenConfigured: githubTokenConfigured(),
    repository: `${config.owner}/${config.repo}`,
    branch: config.branch,
    imageStorage: 'GitHub public repository files (media/)',
    dataStorage: 'portfolio.json in GitHub repository'
  });
}
