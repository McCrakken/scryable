import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.routes';
import { storeRoutes } from "./routes/store.routes";
import { itemRoutes } from "./routes/item.routes";
import {searchRoutes} from "./routes/search.routes";
import {errorHandler} from "./lib/error-handler";

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

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  })

  await app.register(errorHandler)

  app.setNotFoundHandler(
    {
      preHandler: app.rateLimit({ max: 4, timeWindow: '1 minute' }),
    },
    (_request, reply) => {
      return reply.status(404).send({
        error: 'Route not found',
        code: 'NOT_FOUND',
      });
    },
  );

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(storeRoutes, { prefix: '/api/stores' });
  await app.register(itemRoutes, { prefix: '/api/stores' });
  await app.register(searchRoutes, { prefix: '/api/search' });

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🎮 Scryable API running at http://localhost:${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
