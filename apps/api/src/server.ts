import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.routes';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

async function start() {
  // Register plugins
  await app.register(cors, {
    origin: ['http://localhost:5173'], // Vite dev server
    credentials: true,
  });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  // await app.register(storeRoutes, { prefix: '/api/stores' });
  // await app.register(itemRoutes, { prefix: '/api/items' });
  // await app.register(searchRoutes, { prefix: '/api/search' });

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🎮 Scryable API running at http://localhost:${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
