import { FastifyInstance, FastifyError } from 'fastify';
import { AppError } from './errors';

// Prisma error codes we care about
const PRISMA_UNIQUE_CONSTRAINT = 'P2002';
const PRISMA_NOT_FOUND = 'P2025';

interface PrismaKnownError {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === 'object' &&
    error !== null &&
    error.constructor?.name === 'PrismaClientKnownRequestError' &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '';
}

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    // Our own known errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
      });
    }

    // Prisma known errors
    if (isPrismaKnownError(error)) {
      if (error.code === PRISMA_UNIQUE_CONSTRAINT) {
        return reply.status(409).send({
          error: 'A record with this value already exists',
          code: 'CONFLICT',
        });
      }

      if (error.code === PRISMA_NOT_FOUND) {
        return reply.status(404).send({
          error: 'Record not found',
          code: 'NOT_FOUND',
        });
      }
    }

    // JWT errors from jsonwebtoken
    const message = getErrorMessage(error);
    if (message.includes('jwt') || message.includes('JsonWebToken')) {
      return reply.status(401).send({
        error: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      });
    }

    // Fastify's own validation errors (e.g. malformed JSON)
    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode && fastifyError.statusCode < 500) {
      return reply.status(fastifyError.statusCode).send({
        error: fastifyError.message,
        code: fastifyError.code,
      });
    }

    // Unknown — log it and return a generic 500
    request.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    });
  });
}
