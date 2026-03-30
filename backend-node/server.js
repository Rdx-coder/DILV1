require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blogRoutes = require('./routes/blogRoutes');
const seoRoutes = require('./routes/seoRoutes');
const teamRoutes = require('./routes/teamRoutes');
const { processQueuedSeoPings } = require('./controllers/seoController');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
})
.then(() => {
  console.log('✓ MongoDB connected successfully');
  initializeAdmin();
  initializeSeoRetryWorker();
})
.catch((err) => {
  console.error('✗ MongoDB connection error:', err);
  process.exit(1);
});

// Initialize admin account if doesn't exist
async function initializeAdmin() {
  try {
    const Admin = require('./models/Admin');
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      const admin = await Admin.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: 'Admin',
        role: 'admin'
      });
      console.log('✓ Admin account initialized:', admin.email);
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

let seoRetryInterval = null;

function initializeSeoRetryWorker() {
  const intervalMs = Math.max(parseInt(process.env.SEO_RETRY_WORKER_INTERVAL_MS || String(5 * 60 * 1000), 10), 60 * 1000);

  const runWorker = async () => {
    const result = await processQueuedSeoPings(8);
    if (result.processed > 0) {
      console.log(`[SEO_RETRY_WORKER] processed=${result.processed}`);
    }
  };

  // Run once shortly after startup, then continue on interval.
  setTimeout(() => {
    void runWorker();
  }, 8000);

  seoRetryInterval = setInterval(() => {
    void runWorker();
  }, intervalMs);

  console.log(`[SEO_RETRY_WORKER] started interval=${intervalMs}ms`);
}

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api', submissionRoutes);
app.use('/api', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', seoRoutes);

// Root route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dangi Innovation Lab API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      contact: '/api/contact',
      application: '/api/application',
      newsletter: '/api/newsletter',
      blogs: '/api/blogs',
      admin: '/api/admin'
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 8001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (seoRetryInterval) clearInterval(seoRetryInterval);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (seoRetryInterval) clearInterval(seoRetryInterval);
  process.exit(1);
});

module.exports = app;
