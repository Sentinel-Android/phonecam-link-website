import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { escapeHTML } from './html.mjs';
import { renderConnections } from './connectivity.mjs';
export { escapeHTML } from './html.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));

export function resolveConfig(raw, { production = false, siteUrl = process.env.SITE_URL || '' } = {}) {
  const config = { ...raw };
  for (const field of ['repositoryUrl','releaseTag','androidDownloadUrl','windowsDownloadUrl','siteUrl','releaseLabel','description']) {
    if (typeof config[field] !== 'string') throw new Error(`site.config.json: ${field} must be a string.`);
    config[field] = config[field].trim();
  }
  config.repositoryUrl = config.repositoryUrl.replace(/\/$/, '');
  if (config.repositoryUrl && !/^https:\/\/github\.com\/[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(config.repositoryUrl)) throw new Error('repositoryUrl must be a GitHub repository URL: https://github.com/OWNER/REPO');
  if (config.repositoryUrl && /\/(OWNER|YOUR-USERNAME|YOUR-REPO|REPOSITORY)(\/|$)/i.test(config.repositoryUrl)) throw new Error('Replace the example repository URL with your real repository.');
  for (const field of ['androidDownloadUrl','windowsDownloadUrl']) {
    if (!config[field]) continue;
    let url;
    try { url = new URL(config[field]); } catch { throw new Error(`${field} must be a complete HTTPS GitHub Releases URL.`); }
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || !url.pathname.match(/^\/[^/]+\/[^/]+\/releases(?:\/|$)/)) throw new Error(`${field} must point to GitHub Releases over HTTPS.`);
  }
  config.siteUrl = (config.siteUrl || siteUrl).replace(/\/$/, '');
  if (config.siteUrl) {
    let url;
    try { url = new URL(config.siteUrl); } catch { throw new Error('siteUrl must be the complete public HTTPS website URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('siteUrl must be an HTTPS URL without credentials, query or fragment.');
  }
  if (production && !config.repositoryUrl) throw new Error('Set repositoryUrl in site.config.json before publishing.');
  if (production && !config.siteUrl) throw new Error('Set siteUrl in site.config.json, or set SITE_URL before publishing.');
  if (config.releasesUrl !== undefined && typeof config.releasesUrl !== 'string') throw new Error('releasesUrl must be a string.');
  config.releasesUrl = (config.releasesUrl || '').trim().replace(/\/$/, '') || (config.repositoryUrl ? `${config.repositoryUrl}/releases` : '');
  if (config.releasesUrl && !/^https:\/\/github\.com\/[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+\/releases$/.test(config.releasesUrl)) throw new Error('releasesUrl must be a GitHub releases index URL.');
  config.selectedReleaseUrl = config.releasesUrl ? (config.releaseTag ? `${config.releasesUrl}/tag/${encodeURIComponent(config.releaseTag)}` : `${config.releasesUrl}/latest`) : '';
  config.androidUrl = config.androidDownloadUrl || config.selectedReleaseUrl;
  config.windowsUrl = config.windowsDownloadUrl || config.selectedReleaseUrl;
  return config;
}
export const linkAttrs = url => url ? `href="${escapeHTML(url)}"` : 'role="link" aria-disabled="true" tabindex="-1"';
export const pages = ['index.html','downloads.html','get-started.html'];
export async function render({ production = false, siteUrl, page = 'index.html' } = {}) {
  if (!pages.includes(page)) throw new Error('Unknown page');
  const suffix = page === 'index.html' ? '' : page;
  const config = resolveConfig(JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8')), { production, siteUrl });
  const connections = JSON.parse(await readFile(path.join(root,'content/connectivity.json'),'utf8'));
  const tokens = {
    CONNECTIVITY: renderConnections(connections),
    DESCRIPTION: escapeHTML(config.description),
    ANDROID_ATTRS: linkAttrs(config.androidUrl), WINDOWS_ATTRS: linkAttrs(config.windowsUrl),
    RELEASES_ATTRS: linkAttrs(config.releasesUrl), REPOSITORY_ATTRS: linkAttrs(config.repositoryUrl),
    RELEASE_MESSAGE: escapeHTML(config.repositoryUrl ? config.releaseLabel : 'Download links will appear when a public release is available.'),
    YEAR: String(new Date().getFullYear()),
    SEO_TAGS: config.siteUrl ? `<link rel="canonical" href="${escapeHTML(config.siteUrl)}/${suffix}">\n  <meta property="og:url" content="${escapeHTML(config.siteUrl)}/${suffix}">\n  <meta property="og:image" content="${escapeHTML(config.siteUrl)}/assets/social-preview.jpg">\n  <meta property="og:image:alt" content="An alpine mountain and lake, the illustrative camera scene from PhoneCam Link.">` : '<meta name="robots" content="noindex, nofollow">'
  };
  const source = await readFile(path.join(root,page),'utf8');
  const html = source.replace(/\{\{([A-Z_]+)\}\}/g, (_, token) => {
    if (!(token in tokens)) throw new Error(`Unknown template token: ${token}`);
    return tokens[token];
  });
  return { html, config };
}
