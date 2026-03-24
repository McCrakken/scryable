import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireOwner } from '../middleware/auth';
import { Platform, Category, Condition } from '../generated/prisma/client';
import {
  createItem,
  getItemsByStore,
  getItemById,
  updateItem,
  deleteItem,
} from '../services/item.service';

// Derive these directly from the Prisma enum so they stay in sync automatically
const platformValues = Object.values(Platform) as [string, ...string[]];
const conditionValues = Object.values(Condition) as [string, ...string[]];
const categoryValues = Object.values(Category) as [string, ...string[]];

const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  platform: z.enum(platformValues as [Platform, ...Platform[]]),
  category: z.enum(categoryValues as [Category, ...Category[]]),
  condition: z.enum(conditionValues as [Condition, ...Condition[]]),
  price: z.number().min(0),
  imageUrls: z.array(z.string().url()).optional(),
  isPromoted: z.boolean().optional(),
});

const updateItemSchema = createItemSchema.partial().extend({
  isSold: z.boolean().optional(),
});

export async function itemRoutes(app: FastifyInstance) {
  // GET /api/stores/:storeId/items — public
  app.get('/:storeId/items', async (request, reply) => {
    const { storeId } = request.params as { storeId: string };
    const items = await getItemsByStore(storeId);
    return reply.send(items);
  });

  // GET /api/items/:id — public
  app.get('/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await getItemById(id);
    if (!item) return reply.status(404).send({ error: 'Item not found' });
    return reply.send(item);
  });

  // POST /api/stores/:storeId/items — owner only
  app.post(
    '/:storeId/items',
    { preHandler: [authenticate, requireOwner] },
    async (request, reply) => {
      const { storeId } = request.params as { storeId: string };
      const result = createItemSchema.safeParse(request.body);
      if (!result.success) {
        return reply
          .status(400)
          .send({ error: 'Validation failed', details: result.error.flatten() });
      }

      const item = await createItem(storeId, request.user!.userId, result.data);
      if (!item) return reply.status(404).send({ error: 'Store not found' });
      return reply.status(201).send(item);
    },
  );

  // PATCH /api/items/:id — owner only
  app.patch(
    '/items/:id',
    { preHandler: [authenticate, requireOwner] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = updateItemSchema.safeParse(request.body);
      if (!result.success) {
        return reply
          .status(400)
          .send({ error: 'Validation failed', details: result.error.flatten() });
      }

      const item = await updateItem(id, request.user!.userId, result.data);
      if (!item) return reply.status(404).send({ error: 'Item not found' });
      return reply.send(item);
    },
  );

  // DELETE /api/items/:id — owner only
  app.delete(
    '/items/:id',
    { preHandler: [authenticate, requireOwner] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await deleteItem(id, request.user!.userId);
      if (!result) return reply.status(404).send({ error: 'Item not found' });
      return reply.status(204).send();
    },
  );
}
