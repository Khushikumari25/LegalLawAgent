const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const analysisRoutes = require('./routes/analysis.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/report.routes');
const assistantRoutes = require('./routes/assistant.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
let server;

// Trust proxy (required for Render, Railway, and other reverse-proxy hosts)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.tailwindcss.com",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.tailwindcss.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true, // true allows any origin with credentials in dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/reports-output', express.static(path.join(__dirname, '../reports-output')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'success',
    message: 'AI Legal Intelligence System is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoUriSet: !!process.env.MONGODB_URI
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/cases`, caseRoutes);
app.use(`/api/${API_VERSION}/analysis`, analysisRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/reports`, reportRoutes);
app.use(`/api/${API_VERSION}/assistant`, assistantRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API route not found'
  });
});

// For non-API routes, serve the frontend index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let dbConnected = false;
  try {
    dbConnected = await connectDB();
  } catch (error) {
    logger.warn('Database connection failed, running in NO-DATABASE mode');
    dbConnected = false;
  }
  
  server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API Version: ${API_VERSION}`);
    logger.info(`CrewAI Integration: ACTIVE ✓`);
    if (dbConnected) {
      logger.info(`Database: CONNECTED ✓`);
    } else {
      logger.warn(`Database: NOT CONNECTED (Testing mode)`);
      logger.warn(`To enable database: Set up MongoDB Atlas or install MongoDB locally`);
      logger.warn(`See START_PROJECT.md for instructions`);
    }
    logger.info(`\n✓ Server is ready!`);
    logger.info(`Backend API: http://localhost:${PORT}/api/${API_VERSION}`);
    logger.info(`Health Check: http://localhost:${PORT}/health`);
    logger.info(`Frontend: Open frontend/index.html in your browser\n`);
  });
};

startServer();

// Graceful shutdown
let isShuttingDown = false;

function gracefulShutdown(signal, error) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  if (error) {
    logger.error(`${signal}: ${error.message}`);
    logger.error(error.stack);
  } else {
    logger.info(`${signal} received. Starting graceful shutdown...`);
  }
  
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  // Close database connection
  mongoose.connection.close(false).then(() => {
    logger.info('MongoDB connection closed');
    clearTimeout(forceExitTimeout);
    process.exit(error ? 1 : 0);
  }).catch((err) => {
    logger.error(`Error closing MongoDB: ${err.message}`);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  gracefulShutdown('Unhandled Rejection', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  gracefulShutdown('Uncaught Exception', err);
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

module.exports = app;
