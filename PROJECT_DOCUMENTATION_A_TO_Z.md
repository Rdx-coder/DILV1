# Dangi Innovation Lab (DIL) SaaS Script Documentation

## 1. Document Purpose
This is the master A-to-Z documentation for the Dangi Innovation Lab full-stack platform.

It is designed to help:
- founders and operators understand platform capabilities
- developers set up, run, and extend the system
- admins manage content and submissions safely
- deployment engineers ship to production correctly
- support teams troubleshoot common issues quickly

This project is a production-ready nonprofit-style SaaS script with:
- public website
- admin dashboard
- blog CMS
- team management
- form intake + email response workflows
- SEO automation + sitemap operations

## 2. High-Level Product Overview
DIL is a digital-first community platform for education, mentorship, and innovation.

### Public capabilities
- informational pages (home, about, programs, mentorship, transparency, support, contact)
- public team directory
- blog listing and blog detail pages
- success stories page powered by blog category filters
- form submissions (contact, application, newsletter)

### Admin capabilities
- secure JWT login
- dashboard with submission analytics
- submission review and status tracking
- direct email replies from dashboard
- blog CRUD with rich text editor and SEO fields
- team member CRUD and ordering
- sitemap ping management and retry operations

## 3. System Architecture

### Frontend
- React (Create React App + CRACO)
- React Router for routing
- lazy-loaded routes for performance
- custom design system via App.css tokens and utility classes

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth for admin endpoints
- CSRF enforcement for non-idempotent API requests
- express-validator based request validation

### Data layer
- MongoDB collections:
  - admins
  - submissions
  - blogs
  - teammembers
  - seopinglogs

### Integrations
- SMTP via Nodemailer (email sending)
- optional Google Analytics tracking in frontend
- optional integration API key for sitemap ping endpoint

## 4. Repository Structure

```text
DILV1-main/
  backend-node/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    uploads/
    utils/
    server.js
  frontend/
    public/
    scripts/
    src/
    package.json
  README.md
  SEO_DEPLOYMENT_CHECKLIST.md
  DIL_Website_Improvement _Plane.md
```

## 5. Feature Matrix

### Public Website
- responsive pages and modern UI
- SEO tags and structured metadata
- blog listing with filters and detail pages
- success stories via category-based blog rendering
- floating contact CTA and improved UX patterns

### Admin Dashboard
- auth-protected routes
- submissions table with filtering and search
- status update workflow: new, in_progress, replied, closed
- reply-to-submission with email templates
- blog editor (rich HTML, SEO title/description, tags, category, status)
- team member manager (images, social links, ordering)

### Platform and Security
- CSRF token issuance and validation
- rate limiting for public forms and API
- XSS and content sanitization for blog content
- password strength policy for admins
- error logging endpoint for frontend runtime issues

## 6. Data Models

## 6.1 Admin
- email (unique)
- password (hashed with bcrypt)
- name
- role
- isActive
- lastLogin

Security rule:
- password must include uppercase, lowercase, digit, special char, min length 12

## 6.2 Submission
- formType: contact | application | mentorship | newsletter
- name
- email
- subject
- message
- interest
- phone
- status: new | in_progress | replied | closed
- replies[] with sentBy and sentAt
- metadata map
- ipAddress
- userAgent

## 6.3 Blog
- title
- slug (auto-generated/normalized, unique)
- content (sanitized rich HTML)
- excerpt
- coverImage
- coverImageAlt
- tags[]
- category: general | success-story | tutorial | announcement
- author
- status: draft | published
- seoTitle
- seoDescription

Behavior:
- excerpt/SEO fields auto-derived when omitted
- tags normalized to lowercase and trimmed
- slug collision-safe generation

## 6.4 TeamMember
- name
- role
- bio
- image { filename, url, altText }
- social { linkedin, email, portfolio, github, twitter }
- order
- isActive

## 6.5 SeoPingLog
- sitemapUrl
- triggerType: manual | auto
- reason
- success, successCount, totalTargets
- retryStatus: none | queued | completed | exhausted
- attemptCount, maxRetries, nextRetryAt
- results[] and attemptHistory[]

## 7. API Reference (Functional Summary)
Base URL (local):
- http://localhost:8001/api

## 7.1 Public endpoints
- GET /api/health
- GET /api
- GET /api/blogs
- GET /api/blog/:slug
- GET /api/blog/:slug/og-image.svg
- GET /api/team
- GET /api/team/:id
- POST /api/contact
- POST /api/application
- POST /api/newsletter
- GET /api/csrf-token
- POST /api/client-errors

## 7.2 Auth endpoints
- POST /api/auth/login
- POST /api/auth/init
- GET /api/auth/me (protected)

## 7.3 Admin endpoints (JWT protected)
- GET /api/admin/stats
- GET /api/admin/submissions
- GET /api/admin/submissions/:id
- PUT /api/admin/submissions/:id/status
- POST /api/admin/submissions/:id/reply
- DELETE /api/admin/submissions/:id

Blog admin:
- POST /api/admin/blog/upload
- POST /api/admin/blog
- PUT /api/admin/blog/:id
- DELETE /api/admin/blog/:id
- GET /api/admin/blogs
- GET /api/admin/blog/:id

SEO admin:
- POST /api/admin/seo/ping-sitemap
- GET /api/admin/seo/ping-history
- POST /api/admin/seo/retry-failed

## 7.4 Team admin endpoints (JWT protected)
- GET /api/team/admin/all
- POST /api/team/admin/create
- PUT /api/team/admin/:id/update
- DELETE /api/team/admin/:id/delete
- POST /api/team/admin/reorder

## 7.5 SEO utility endpoints
- GET /robots.txt
- GET /sitemap.xml
- POST /api/integrations/seo/ping-sitemap (API key protected)

## 8. Authentication and Security Flow

### JWT flow
1. Admin logs in via /api/auth/login
2. Backend returns JWT token
3. Frontend stores token and sends Authorization: Bearer <token>
4. Protected routes validate token via middleware

### CSRF flow
1. Frontend requests GET /api/csrf-token
2. Backend returns signed CSRF token
3. Frontend includes x-csrf-token for POST/PUT/DELETE
4. Backend validates token for non-idempotent methods

### Important rule
- CSRF validation is globally enforced under /api for state-changing operations.

## 9. Frontend Route Map

### Public routes
- /
- /about
- /team
- /success-stories
- /blog
- /blog/:slug
- /programs
- /mentorship
- /transparency
- /support
- /contact

### Admin routes
- /admin/login
- /admin/dashboard
- /admin/blogs
- /admin/blog/new
- /admin/blog/edit/:id
- /admin/team

## 10. Success Stories Implementation
Success stories are implemented using blog category strategy.

Source of truth:
- blog documents where category = success-story and status = published

Where rendered:
- /success-stories page
- home testimonials section

Navigation behavior:
- Read full story links to /blog/:slug

Admin workflow:
1. Open Admin Blog Editor
2. Select category success-story
3. Publish
4. Story appears automatically in success story surfaces

## 11. Environment Variables

## 11.1 Backend (.env)
Core:
- NODE_ENV
- PORT
- MONGO_URL
- DB_NAME

Auth and security:
- JWT_SECRET
- JWT_EXPIRE
- CSRF_SECRET
- CSRF_TOKEN_TTL_MS

Admin bootstrap:
- ADMIN_EMAIL
- ADMIN_PASSWORD

Rate limiting and cache:
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- PUBLIC_FORM_WINDOW_MS
- PUBLIC_FORM_MAX_REQUESTS
- UPLOADS_CACHE_MAX_AGE
- UPLOADS_CACHE_MAX_AGE_SECONDS

SEO/integration:
- FRONTEND_URL
- SEO_RETRY_WORKER_INTERVAL_MS
- SEO_ENABLE_LEGACY_PING
- INTEGRATION_API_KEY
- SEO_PING_MAX_RETRIES
- SEO_PING_RETRY_BASE_MS

Email:
- EMAIL_SERVICE
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_SECURE
- EMAIL_USER
- EMAIL_PASSWORD
- EMAIL_FROM

## 11.2 Frontend (.env)
- REACT_APP_BACKEND_URL
- REACT_APP_GA_MEASUREMENT_ID
- REACT_APP_FRONTEND_URL
- SITEMAP_BACKEND_URL

## 12. Local Development Setup

Prerequisites:
- Node.js 18+ recommended
- npm or yarn
- MongoDB local or remote

Step 1: clone and install

Backend:
```bash
cd backend-node
npm install
```

Frontend:
```bash
cd frontend
npm install
```

Step 2: configure environment files

Windows:
```bash
copy backend-node\.env.example backend-node\.env
copy frontend\.env.example frontend\.env
```

Linux/macOS:
```bash
cp backend-node/.env.example backend-node/.env
cp frontend/.env.example frontend/.env
```

Step 3: run services

Backend:
```bash
cd backend-node
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

Step 4: verify
- frontend: http://localhost:3000
- backend: http://localhost:8001/api/health
- admin login: http://localhost:3000/admin/login

## 13. Build and Deployment

## 13.1 Frontend
```bash
cd frontend
npm run build
```

Notes:
- prebuild automatically generates sitemap.xml
- set SITEMAP_BACKEND_URL or REACT_APP_BACKEND_URL for dynamic blog URLs
- set REACT_APP_FRONTEND_URL for canonical domain

## 13.2 Backend
```bash
cd backend-node
npm start
```

Deploy backend with:
- Node process manager (pm2/systemd) recommended
- reverse proxy (nginx/caddy) with HTTPS
- production MongoDB and secret rotation

## 13.3 CORS and CSRF production checklist
- FRONTEND_URL must match deployed frontend origin exactly
- backend must not use wildcard origin when credentials are enabled
- frontend must fetch /api/csrf-token from backend origin
- frontend must send x-csrf-token for POST/PUT/DELETE requests

## 14. SEO and Discovery Operations

Built-in features:
- backend robots.txt generation
- backend sitemap.xml generation with published blogs
- frontend sitemap generation at build time
- OG image endpoint per blog
- admin-triggered and auto-triggered sitemap ping actions
- retry worker for failed SEO ping attempts

Refer to SEO_DEPLOYMENT_CHECKLIST.md for full go-live checks.

## 15. Testing and Verification

### Manual smoke tests
- public pages load and route correctly
- forms submit and appear in admin
- admin login, dashboard stats, filters, status updates
- blog create/edit/delete and public rendering
- team CRUD and ordering
- success stories category flow

### Scripted API smoke tests
```bash
cd backend-node
./test-api.sh
```

## 16. Operational Runbook

### Logs
- backend uses morgan and server-side console logs
- client errors can be posted to /api/client-errors

### Recovery
- if CSRF token fetch fails: verify CORS, FRONTEND_URL, and backend restart
- if admin auth fails: validate JWT_SECRET consistency and token expiry
- if blog publish fails with image: verify cover image dimensions >= 1200x630

### Data maintenance
- ensure regular MongoDB backups
- monitor collection size and index efficiency
- archive stale logs if needed

## 17. Known Pending Roadmap Items
From the improvement plan, major implemented areas are complete, while some future items remain:
- user accounts and progress tracking
- bulk team CSV operations
- scheduled publishing
- backup automation
- multi-role admin permissions

## 18. Recommended SaaS Hardening (Next Level)
For commercial-grade SaaS distribution, add:
- tenant isolation model (if multi-tenant is desired)
- refresh token strategy and secure cookie auth option
- structured audit trail for all admin writes
- centralized error and metrics stack (Sentry + OpenTelemetry)
- CI/CD pipeline with automated tests and rollback strategy
- infra-as-code and environment parity controls

## 19. Quick Command Reference

Backend:
```bash
npm run dev
npm start
```

Frontend:
```bash
npm start
npm run build
npm run generate:sitemap
```

## 20. Ownership and Change Management
When changing core modules, update this document sections:
- routes/controllers: Section 7
- model fields: Section 6
- env vars: Section 11
- deployment behavior: Sections 13 and 14
- runbook/troubleshooting: Section 16

This keeps onboarding and maintenance friction low as the codebase evolves.

---

If you want, the next step can be generating:
1. investor-facing SaaS product brief
2. developer-only technical handbook
3. API docs in OpenAPI 3.0 format from current routes
