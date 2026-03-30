# SEO Deployment Checklist

## 1. Environment Configuration
- Set `FRONTEND_URL` in backend environment to your production frontend URL (for canonical links, robots, and sitemap).
- Set `REACT_APP_BACKEND_URL` in frontend environment to backend public URL.
- For frontend build-time sitemap generation, set at least one backend URL variable:
  - `SITEMAP_BACKEND_URL=https://your-backend-domain` (preferred)
  - or `REACT_APP_BACKEND_URL=https://your-backend-domain`
- Set `REACT_APP_FRONTEND_URL=https://dangiinnovationlab.com` so generated sitemap URLs use the production domain.
- Ensure HTTPS is enabled for both frontend and backend domains.

## 2. Crawl and Index Essentials
- Verify `https://your-backend-domain/robots.txt` returns:
  - `Allow: /`
  - `Disallow: /admin/`
  - `Disallow: /api/`
  - `Sitemap: https://your-frontend-domain/sitemap.xml`
- Verify `https://your-backend-domain/sitemap.xml` returns all static pages and published blogs.
- Verify API endpoints include `X-Robots-Tag: noindex, nofollow, noarchive`.

## 3. Metadata Validation
- Test homepage, static pages, blog list, and blog detail in an SEO inspector.
- Confirm each page has:
  - unique `<title>`
  - unique meta description
  - canonical URL
  - Open Graph title/description/image
  - Twitter card tags

## 4. Structured Data Checks
- Validate JSON-LD with Google's Rich Results Test:
  - Homepage: Organization + WebSite + SearchAction
  - Content pages: WebPage
  - Blog list: CollectionPage + ItemList
  - Blog detail: BlogPosting + BreadcrumbList

## 5. Image SEO Rules
- For published blogs with cover image:
  - Cover image minimum size: 1200x630
  - `coverImageAlt` must be provided
  - Use meaningful filenames and avoid generic names
- Ensure important inline images include alt text in blog content.

## 6. Search Engine Setup
- Google Search Console:
  - verify domain/property
  - submit sitemap URL
  - request indexing for homepage and key blog pages
- Bing Webmaster Tools:
  - verify domain/property
  - submit sitemap URL
- Note: Google deprecated `sitemaps/ping`; do not rely on Google ping URL response codes for SEO health.
- Note: Bing legacy `sitemaps/ping` may return HTTP 410 in many setups; do not treat it as a blocking SEO failure.

## 7. Performance and UX (SEO Impact)
- Enable gzip/brotli at hosting layer.
- Cache static assets aggressively with immutable filenames.
- Optimize and compress large images before upload.
- Keep layout stable (reduce CLS) and lazy-load non-critical images.

## 8. Ongoing Operations
- Sitemap ping now triggers automatically when blogs are published/updated in published state.
- Failed/partial ping attempts are queued and retried automatically with backoff by backend worker.
- You can still trigger manual sitemap ping endpoint when needed:
  - `POST /api/admin/seo/ping-sitemap` (requires admin auth)
  - Default mode is modern/no-op (no legacy external ping targets).
  - Enable legacy ping explicitly only if needed: `SEO_ENABLE_LEGACY_PING=true`.
- You can manually process pending retry queue:
  - `POST /api/admin/seo/retry-failed` (requires admin auth)
- You can monitor retry queue and history:
  - `GET /api/admin/seo/ping-history`
- Re-run metadata + structured data validation after major UI/content changes.
- Monitor crawl errors and Core Web Vitals in Search Console.
