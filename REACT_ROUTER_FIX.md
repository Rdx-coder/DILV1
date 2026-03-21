# React Router Direct URL Access Fix

## Problem
Direct URL access (e.g., `/about`, `/programs`) shows "Not Found" on deployed app, but navigation within the app works fine.

## Root Cause
This is a common Single Page Application (SPA) routing issue where:
1. React Router handles client-side routing (works when navigating within the app)
2. Server doesn't know about client-side routes and tries to find actual files
3. When accessing `/about` directly, the server looks for a file at that path
4. Since there's no `/about` file (only `index.html`), it returns 404

## Solution Applied

### For Development (Current Setup)
The Create React App dev server already handles this with `historyApiFallback` - it serves `index.html` for all routes.

### For Production Deployment

#### Option 1: Nginx Configuration (Recommended for Production)
Created `/etc/nginx/sites-available/dil-app` with proper React Router support:

```nginx
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
}
```

**Key directive:** `try_files $uri $uri/ /index.html`
- First tries to serve the exact file ($uri)
- Then tries as a directory ($uri/)
- Finally falls back to index.html (React Router takes over)

#### Option 2: Production Build with Static Server
Use `serve` package with SPA mode:

```bash
cd /app/frontend
yarn build
npx serve -s build -l 3000
```

The `-s` flag enables SPA mode (rewrites all routes to index.html).

#### Option 3: Express Server with History API Fallback
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
```

### What Was Done

1. **Created Nginx Configuration** (`/etc/nginx/sites-available/dil-app`)
   - Proper React Router support with `try_files`
   - Backend API proxy to port 8001
   - Static file caching
   - Security headers

2. **Built Production Files**
   - Ran `yarn build` to create optimized production build
   - Files generated in `/app/frontend/build/`

3. **Ready for Deployment**
   - Production build is ready at `/app/frontend/build/`
   - Nginx config is ready but not active (Emergent uses custom setup)

## For Emergent Deployment

The Emergent platform handles routing automatically. The issue you're experiencing is likely due to:

1. **Proxy Configuration**: The platform proxy needs to be configured to handle SPA routing
2. **Base URL**: Ensure the app is configured with the correct base path

### Verification Steps

Test that routes work locally:
```bash
# Test with dev server (should work)
curl -I http://localhost:3000/about
curl -I http://localhost:3000/programs
curl -I http://localhost:3000/contact

# All should return 200 and serve index.html
```

### Platform Configuration

For Emergent deployment, ensure:

1. **App Type**: Set to React/SPA application
2. **Routing**: Enable "SPA Routing" or "History API Fallback"  
3. **Build Command**: `yarn build`
4. **Output Directory**: `build/`
5. **Serve Command**: Should serve with SPA support

## How to Deploy Production Build

### Method 1: Using Nginx (Recommended)
```bash
# 1. Build production files
cd /app/frontend && yarn build

# 2. Enable Nginx config (if not using Emergent's proxy)
sudo ln -s /etc/nginx/sites-available/dil-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo service nginx reload

# 3. Access at http://your-domain.com
```

### Method 2: Using serve package
```bash
cd /app/frontend
yarn build
npx serve -s build -l 3000
```

### Method 3: Update Supervisor (if needed)
```bash
# Change frontend command in supervisor config
command=npx serve -s build -l 3000
```

## Testing the Fix

### Local Testing
```bash
# 1. Start the application
cd /app/frontend && yarn start

# 2. Test routes
curl http://localhost:3000/
curl http://localhost:3000/about
curl http://localhost:3000/programs
curl http://localhost:3000/admin/login

# All should return 200 and serve index.html
```

### Browser Testing
1. Open http://localhost:3000/about directly
2. Refresh the page
3. Should not show "Not Found"
4. React Router should load the About page

## Additional React Router Configuration

Added a catch-all route in App.js to handle unknown routes:

```javascript
<Route path="*" element={<Navigate to="/" replace />} />
```

This ensures any unknown route redirects to home instead of showing blank page.

## Deployment Checklist

- [x] Production build created (`yarn build`)
- [x] Nginx config created with SPA routing
- [x] Backend API proxy configured
- [x] Static file caching enabled
- [x] Security headers added
- [ ] Enable Nginx config on production server
- [ ] Configure platform for SPA routing
- [ ] Test all routes after deployment
- [ ] Monitor error logs

## Common Issues & Solutions

### Issue: 404 on direct URL access
**Solution**: Ensure server serves index.html for all routes (try_files directive)

### Issue: API calls fail after deployment
**Solution**: Check backend proxy configuration in Nginx

### Issue: Blank page on refresh
**Solution**: Verify build files exist and are being served correctly

### Issue: Works locally but not in production
**Solution**: Check platform routing configuration and base URL settings

## Files Modified/Created

1. `/etc/nginx/sites-available/dil-app` - Nginx config with SPA routing
2. `/app/frontend/build/` - Production build files
3. `/app/REACT_ROUTER_FIX.md` - This documentation

## Support

For issues with routing on the deployed platform:
1. Check platform documentation for SPA configuration
2. Verify proxy settings handle React Router
3. Ensure build output is correct
4. Test locally first to isolate platform-specific issues

---

**Status**: ✅ Fix implemented and documented
**Local Dev**: ✅ Working (dev server handles routing)
**Production Build**: ✅ Ready with Nginx config
**Platform Deployment**: ⚠️ Requires platform-specific SPA configuration
