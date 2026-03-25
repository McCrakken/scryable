import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './routes/auth.routes';
import { storeRoutes } from "./routes/store.routes";
import { itemRoutes } from "./routes/item.routes";
import {searchRoutes} from "./routes/search.routes";
import {errorHandler} from "./lib/error-handler";
import {prisma} from "./lib/prisma";

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
  // Adds a unique requestId to every request — visible in logs automatically
  genReqId: (req) => {
    return req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
  },
});

// ─── Request logging hook ──────────────────────────────────────────────────────

app.addHook('onRequest', async (request) => {
  request.log.info({ method: request.method, url: request.url }, 'incoming request');
});

app.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    },
    'request completed',
  );
});

// ─── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();       // Stop accepting new requests, wait for in-flight to finish
    await prisma.$disconnect(); // Close the database connection pool
    app.log.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    app.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker/cloud sends this to stop a container
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C in terminal

// ─── Server startup ────────────────────────────────────────────────────────────

async function start() {
  // Register plugins
  await app.register(cors, {
    origin: ['http://localhost:5173'], // Vite dev server
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      }
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    }
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Too many requests, please slow down',
      code: 'RATE_LIMITED_EXCEEDED',
    }),
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
