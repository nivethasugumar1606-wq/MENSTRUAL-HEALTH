import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import periodRoutes from './routes/periodRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import learningRoutes from './routes/learningRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));

// Rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this device. Please pause for a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nurtura API',
    module: 'Girls 10-16 Menstrual Health & Education'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/learning', learningRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} not found.`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Never log sensitive bodies or tokens
  console.error(`[Error] ${req.method} ${req.path}:`, err?.message || err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'Something went wrong on the server. Your data is safe; please try again shortly.'
        : err.message || 'An error occurred.'
  });
});

// Start server if not running in Jest test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌸 Nurtura Backend running on http://localhost:${PORT}`);
  });
}

export default app;
