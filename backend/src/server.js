import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

import vtonRoutes from './routes/vtonRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve directory for temporary generated try-on previews
// Supports both monorepo local dev and standalone Render deployments
function resolveGeneratedDir() {
  if (process.env.GENERATED_DIR) {
    return path.resolve(process.env.GENERATED_DIR);
  }
  const monorepoPath = path.resolve(__dirname, '../../frontend/public/generated');
  if (fs.existsSync(monorepoPath)) {
    return monorepoPath;
  }
  // Standalone backend folder on Render / Cloud container
  return path.resolve(__dirname, '../public/generated');
}

const GENERATED_DIR = resolveGeneratedDir();
if (!fs.existsSync(GENERATED_DIR)) {
  try {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Storage] Notice creating generated directory:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable trust proxy for HTTPS reverse proxies (Render, Railway, Cloud Run, Vercel)
app.set('trust proxy', 1);

// Configure CORS for local development, production Vercel frontend, and custom domains
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...configuredOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, health monitors, server-to-server)
    if (!origin) return callback(null, true);

    // Explicitly matching origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Local development origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Allow official Vercel preview and production deployment domains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Permissive wildcard fallback if configured
    if (process.env.CORS_ORIGIN === '*' || !process.env.CLIENT_URL) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not permitted: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON request bodies with 50MB limit for high-resolution photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'FITFUSION REST API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      vtonStatus: '/api/vton/status',
      anywearStatus: '/api/vton/anywear/status',
      tryOn: '/api/vton/try-on'
    }
  });
});

// Dual health-check endpoints (supports probes to both /health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FITFUSION API is running',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Serve generated VTON preview images with explicit cross-origin headers
const staticOptions = {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=3600');
  }
};

app.use('/generated', express.static(GENERATED_DIR, staticOptions));
app.use('/api/generated', express.static(GENERATED_DIR, staticOptions));

// VTON API Routes
app.use('/api/vton', vtonRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized production-safe error handler: prevents leaking stack traces
app.use((err, req, res, next) => {
  console.error('[FITFUSION Error]', err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || (err.message?.includes('CORS') ? 403 : 500);

  res.status(status).json({
    success: false,
    error: isProd && status === 500
      ? 'An unexpected error occurred while processing the request.'
      : err.message || 'Internal server error',
    code: err.code || (status === 403 ? 'CORS_REJECTED' : 'SERVER_ERROR'),
    ...(isProd ? {} : { stack: err.stack })
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`FITFUSION API server running on http://${HOST}:${PORT}`);
});

export default app;

