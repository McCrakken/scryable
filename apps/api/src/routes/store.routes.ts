import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireOwner } from '../middleware/auth';
import {
  createStore,
  getStores,
  getStoreById,
  getStoresByOwner,
  updateStore,
  deleteStore,
} from '../services/store.service';

const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  phone: z.string().optional(),
  website: z.string().url().optional(),
});

const updateStoreSchema = createStoreSchema.partial();

export async function storeRoutes(app: FastifyInstance) {
  // GET /api/stores — public
  app.get('/', async (_request, reply) => {
    const stores = await getStores();
    return reply.send(stores);
  });

  // GET /api/stores/mine — owner's own stores (authenticated)
  app.get('/mine', { preHandler: [authenticate] }, async (request, reply) => {
    const stores = await getStoresByOwner(request.user!.userId);
    return reply.send(stores);
  });

  // GET /api/stores/:id — public
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const store = await getStoreById(id);
    if (!store) return reply.status(404).send({ error: 'Store not found' });
    return reply.send(store);
  });

  // POST /api/stores — owner only
  app.post('/', { preHandler: [authenticate, requireOwner] }, async (request, reply) => {
    const result = createStoreSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: 'Validation failed', details: result.error.flatten() });
    }

    const store = await createStore(request.user!.userId, result.data);
    return reply.status(201).send(store);
  });

  // PATCH /api/stores/:id — owner only
  app.patch('/:id', { preHandler: [authenticate, requireOwner] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = updateStoreSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: 'Validation failed', details: result.error.flatten() });
    }

    const store = await updateStore(id, request.user!.userId, result.data);
    if (!store) return reply.status(404).send({ error: 'Store not found' });
    return reply.send(store);
  });

  // DELETE /api/stores/:id — owner only
  app.delete('/:id', { preHandler: [authenticate, requireOwner] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await deleteStore(id, request.user!.userId);
    if (!result) return reply.status(404).send({ error: 'Store not found' });
    return reply.status(204).send();
  });
}
