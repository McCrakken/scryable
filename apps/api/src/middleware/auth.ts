import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../services/auth.service';
import type { Role } from '@scryable/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: Role;
    };
  }
}

/** Require a valid access token on the request. */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    request.user = payload;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

/** Require the authenticated user to have the 'owner' role. */
export async function requireOwner(request: FastifyRequest, reply: FastifyReply) {
  if (request.user?.role !== 'owner') {
    return reply.status(403).send({ error: 'Owner access required' });
  }
}
