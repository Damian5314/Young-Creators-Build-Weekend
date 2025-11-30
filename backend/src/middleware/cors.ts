import cors from 'cors';
import { env } from '../config/env';

export const corsMiddleware = cors({
  origin: [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey'],
});
