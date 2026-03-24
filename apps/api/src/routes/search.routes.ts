import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Platform, Category, Condition } from '../generated/prisma/client';
import { searchItems } from '../services/search.service';

const platformValues = Object.values(Platform) as [Platform, ...Platform[]];
const conditionValues = Object.values(Condition) as [Condition, ...Condition[]];
const categoryValues = Object.values(Category) as [Category, ...Category[]];

const searchParamsSchema = z.object({
  query: z.string().optional(),
  platform: z.enum(platformValues).optional(),
  category: z.enum(categoryValues).optional(),
  condition: z.enum(conditionValues).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  storeId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function searchRoutes(app: FastifyInstance) {
  // GET /api/search?query=mario&platform=SNES&minPrice=10&maxPrice=100&page=1&limit=20
  app.get('/', async (request, reply) => {
    const result = searchParamsSchema.safeParse(request.query);
    if (!result.success) {
      return reply
        .status(400)
        .send({ error: 'Invalid search parameters', details: result.error.flatten() });
    }

    const searchResult = await searchItems(result.data);
    return reply.send(searchResult);
  });
}
