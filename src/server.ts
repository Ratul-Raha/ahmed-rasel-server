import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blog';
import galleryRoutes from './routes/gallery';
import uploadRoutes from './routes/upload';
import path from 'path';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [])
    ];
    
    if (!origin) {
      return callback(null, true);
    }

    // Exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Hostname suffix match (handles Vercel preview deployments and subdomains)
    try {
      const originUrl = new URL(origin);
      for (const allowed of allowedOrigins) {
        const allowedUrl = new URL(allowed);
        if (
          originUrl.hostname === allowedUrl.hostname ||
          originUrl.hostname.endsWith('.' + allowedUrl.hostname)
        ) {
          return callback(null, true);
        }
      }
    } catch {}

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;