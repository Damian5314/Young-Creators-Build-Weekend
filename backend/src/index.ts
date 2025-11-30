import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import routes from './routes/index';
import { corsMiddleware, errorHandler, notFoundHandler } from './middleware';
import { env } from './config/env';

// Load .env from root directory for legacy scripts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

