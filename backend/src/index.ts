import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.ts';
import aiChefRoutes from './routes/aiChefRoutes.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
<<<<<<< HEAD
app.use('/api/recipes', aiChefRoutes);
=======
app.use('/api/ai-chef', aiChefRoutes);
app.use('/api', apiRoutes);
>>>>>>> c79a04e01d48915512423bcbf407a774a8f98c81

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

