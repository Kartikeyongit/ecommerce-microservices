const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const proxy = httpProxy.createProxyServer({ timeout: 5000, proxyTimeout: 5000 });

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const limit = rateLimit.get(ip);
  if (now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests', retryAfter: Math.ceil((limit.resetTime - now) / 1000) });
  }
  
  limit.count++;
  return next();
}

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (!res.headersSent) {
    res.status(502).json({ error: 'Service unavailable' });
  }
});

app.use(cors());
app.use(morgan('dev'));
app.use(rateLimiter);

// Request tracking middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Gateway',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Proxy routes with logging
const routes = {
  '/api/auth': 'http://auth-service:3001',
  '/api/products': 'http://product-service:3002',
  '/api/orders': 'http://order-service:3003',
  '/api/payments': 'http://payment-service:3004',
  '/api/notifications': 'http://notification-service:3005'
};

Object.entries(routes).forEach(([path, target]) => {
  app.all(`${path}`, (req, res) => {
    console.log(`Proxying to ${target}: ${req.method} ${req.url}`);
    proxy.web(req, res, { target });
  });
  
  app.all(`${path}/*`, (req, res) => {
    console.log(`Proxying to ${target}: ${req.method} ${req.url}`);
    proxy.web(req, res, { target });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     🚀 API Gateway Running on ${PORT}          ║
╠════════════════════════════════════════════╣
║  Auth:         /api/auth         :3001    ║
║  Products:     /api/products     :3002    ║
║  Orders:       /api/orders       :3003    ║
║  Payments:     /api/payments     :3004    ║
║  Notifications:/api/notifications:3005    ║
║  Rate Limit:   ${MAX_REQUESTS} req/min per IP      ║
╚════════════════════════════════════════════╝
  `);
});
