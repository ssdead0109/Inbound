import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './db';
import { initInboundDatabase } from './db/inboundDb';
import itemsRouter from './routes/items';
import logsRouter from './routes/logs';
import stockRouter from './routes/stock';
import configRouter from './routes/config';
import inboundRouter from './routes/inbound';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initDatabase();
initInboundDatabase();

// Middleware
app.use(cors());
// Increased limit for Base64 item images and large JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/inbound', inboundRouter);
app.use('/api/items', itemsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/stock', stockRouter);
app.use('/api/config', configRouter);

// Serve frontend static assets if dist exists (Production mode)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 SmartRack Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
