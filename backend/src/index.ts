import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import healthRoutes from './routes/health.js';
import aiChefRoutes from './routes/aiChefRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration - allow all origins for n8n webhook
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for bulk imports

// Routes
app.use('/health', healthRoutes);
app.use('/api/recipes', aiChefRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FlavorSwipe API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      restaurants: '/api/restaurants',
      restaurantImport: 'POST /api/restaurants/import',
      restaurantMap: '/api/restaurants/map',
      recipes: '/api/recipes'
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

