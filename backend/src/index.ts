import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import healthRoutes from './routes/health.ts';
import aiChefRoutes from './routes/aiChefRoutes.ts';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/api/recipes', aiChefRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

