import express from 'express';
import { env, validateEnv } from './config/env';
import { corsMiddleware, errorHandler, notFoundHandler } from './middleware';
import routes from './routes';

// Validate environment variables
validateEnv();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FlavorSwipe API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
🚀 Server running on http://localhost:${PORT}
📚 API available at http://localhost:${PORT}/api
🏥 Health check at http://localhost:${PORT}/api/health
  `);
});

export default app;
