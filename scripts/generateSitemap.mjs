import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const proceduresPath = path.join(publicDir, 'data', 'procedures.v3.json');
const guidelinesPath = path.join(publicDir, 'data', 'guidelines.v1.json');
const protocolsPath = path.join(publicDir, 'data', 'protocoles.v1.json');
const alrPath = path.join(publicDir, 'data', 'alr.v1.json');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const robotsPath = path.join(publicDir, 'robots.txt');

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.anesia.app')
  .trim()
  .replace(/\/+$/, '');
const publicTopics = ['nvpo', 'voie-aerienne', 'alr', 'antibioprophylaxie'];

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildProcedurePath(procedure) {
  const titles = procedure?.titles || {};
  const title = titles.fr || titles.en || titles.pt || procedure.id;
  const slug = normalizeText(title);
  return slug ? `/procedures/${procedure.id}/${slug}` : `/procedures/${procedure.id}`;
}

function buildSpecialtyPath(specialty) {
  const slug = normalizeText(specialty);
  return slug ? `/specialties/${slug}` : '/';
}

function buildGuidelinePath(guideline) {
  const titles = guideline?.titles || {};
  const title = titles.fr || titles.en || titles.pt || guideline.id;
  const slug = normalizeText(title);
  return slug ? `/recommendations/${guideline.id}/${slug}` : `/recommendations/${guideline.id}`;
}

function buildProtocolPath(protocol) {
  const titles = protocol?.titles || {};
  const title = titles.fr || titles.en || titles.pt || protocol.id;
  const slug = normalizeText(title);
  return slug ? `/protocols/${protocol.id}/${slug}` : `/protocols/${protocol.id}`;
}

function buildAlrPath(block) {
  const titles = block?.titles || {};
  const title = titles.fr || titles.en || titles.pt || block.id;
  const slug = normalizeText(title);
  return slug ? `/regional-blocks/${block.id}/${slug}` : `/regional-blocks/${block.id}`;
}

function toUrlEntry(loc, options = {}) {
  const url = `${siteUrl}${loc}`;
  const lines = ['  <url>', `    <loc>${xmlEscape(url)}</loc>`];

  if (options.lastmod) lines.push(`    <lastmod>${xmlEscape(options.lastmod)}</lastmod>`);
  if (options.changefreq) lines.push(`    <changefreq>${xmlEscape(options.changefreq)}</changefreq>`);
  if (typeof options.priority === 'number') {
    lines.push(`    <priority>${options.priority.toFixed(1)}</priority>`);
  }

  lines.push('  </url>');
  return lines.join('\n');
}

const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/specialties', changefreq: 'weekly', priority: 0.8 },
  { loc: '/topics', changefreq: 'weekly', priority: 0.8 },
  { loc: '/pricing', changefreq: 'weekly', priority: 0.9 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.6 },
  { loc: '/about', changefreq: 'monthly', priority: 0.5 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.4 },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.2 },
  { loc: '/terms', changefreq: 'yearly', priority: 0.2 },
];

const procedures = JSON.parse(fs.readFileSync(proceduresPath, 'utf8'));
const guidelines = JSON.parse(fs.readFileSync(guidelinesPath, 'utf8'));
const protocols = JSON.parse(fs.readFileSync(protocolsPath, 'utf8'));
const alrBlocks = JSON.parse(fs.readFileSync(alrPath, 'utf8'));
const specialties = [...new Set(ensureArray(procedures).map((procedure) => procedure.specialty).filter(Boolean))]
  .sort((left, right) => String(left).localeCompare(String(right)));

const procedureEntries = ensureArray(procedures).map((procedure) =>
  toUrlEntry(buildProcedurePath(procedure), {
    lastmod: procedure.updated_at ? new Date(procedure.updated_at).toISOString().slice(0, 10) : undefined,
    changefreq: 'weekly',
    priority: 0.8,
  }),
);

const specialtyEntries = specialties.map((specialty) =>
  toUrlEntry(buildSpecialtyPath(specialty), {
    changefreq: 'weekly',
    priority: 0.7,
  }),
);

const guidelineEntries = ensureArray(guidelines).map((guideline) =>
  toUrlEntry(buildGuidelinePath(guideline), {
    changefreq: 'weekly',
    priority: 0.7,
  }),
);

const protocolEntries = ensureArray(protocols).map((protocol) =>
  toUrlEntry(buildProtocolPath(protocol), {
    changefreq: 'weekly',
    priority: 0.7,
  }),
);

const alrEntries = ensureArray(alrBlocks).map((block) =>
  toUrlEntry(buildAlrPath(block), {
    changefreq: 'weekly',
    priority: 0.7,
  }),
);

const topicEntries = publicTopics.map((slug) =>
  toUrlEntry(`/topics/${slug}`, {
    changefreq: 'weekly',
    priority: 0.7,
  }),
);

const staticEntries = staticRoutes.map((route) => toUrlEntry(route.loc, route));
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticEntries,
  ...topicEntries,
  ...specialtyEntries,
  ...guidelineEntries,
  ...protocolEntries,
  ...alrEntries,
  ...procedureEntries,
  '</urlset>',
  '',
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n');

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
fs.writeFileSync(robotsPath, robots, 'utf8');

console.log(
  `Generated sitemap with ${
    staticEntries.length +
    topicEntries.length +
    specialtyEntries.length +
    guidelineEntries.length +
    protocolEntries.length +
    alrEntries.length +
    procedureEntries.length
  } URLs for ${siteUrl}`,
);
