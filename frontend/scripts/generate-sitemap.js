const fs = require('fs/promises');
const path = require('path');

const SITE_BASE = (process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL || 'https://dangiinnovationlab.com').replace(/\/$/, '');
const BACKEND_BASE = (process.env.SITEMAP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/team', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/programs', changefreq: 'monthly', priority: '0.8' },
  { path: '/mentorship', changefreq: 'monthly', priority: '0.8' },
  { path: '/transparency', changefreq: 'monthly', priority: '0.7' },
  { path: '/support', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' }
];

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchPublishedBlogs() {
  if (!BACKEND_BASE) {
    console.warn('[sitemap] No SITEMAP_BACKEND_URL/REACT_APP_BACKEND_URL set. Skipping dynamic blog URLs.');
    return [];
  }

  const blogs = [];
  const seen = new Set();
  const pageLimit = 100;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 50) {
    const endpoint = `${BACKEND_BASE}/api/blogs?page=${page}&limit=${pageLimit}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs from ${endpoint} (HTTP ${response.status})`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload.blogs) ? payload.blogs : [];

    items.forEach((item) => {
      const slug = String(item.slug || '').trim();
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      blogs.push({
        slug,
        lastmod: item.updatedAt || item.createdAt || null
      });
    });

    totalPages = Number(payload.pages) > 0 ? Number(payload.pages) : 1;
    page += 1;
  }

  return blogs;
}

function buildSitemapXml(dynamicBlogs) {
  const nowIso = new Date().toISOString();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    loc: `${SITE_BASE}${route.path}`,
    lastmod: nowIso,
    changefreq: route.changefreq,
    priority: route.priority
  }));

  const blogEntries = dynamicBlogs.map((blog) => ({
    loc: `${SITE_BASE}/blog/${encodeURIComponent(blog.slug)}`,
    lastmod: blog.lastmod ? new Date(blog.lastmod).toISOString() : nowIso,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allEntries = [...staticEntries, ...blogEntries];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allEntries
    .map((entry) => `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
}

async function run() {
  try {
    let blogs = [];
    try {
      blogs = await fetchPublishedBlogs();
      console.log(`[sitemap] Loaded ${blogs.length} published blog URL(s).`);
    } catch (error) {
      console.warn(`[sitemap] ${error.message}`);
      console.warn('[sitemap] Continuing with static routes only.');
    }

    const xml = buildSitemapXml(blogs);
    await fs.writeFile(OUTPUT_PATH, xml, 'utf8');
    console.log(`[sitemap] Generated ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('[sitemap] Generation failed:', error.message || error);
    process.exitCode = 1;
  }
}

run();
