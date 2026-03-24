-- Full-text search upgrade (run when ready to replace ILIKE with GIN index)
--
-- 1. Create a migration: npx prisma migrate dev --name add_search_vector
-- 2. Replace the generated migration's SQL with the contents below
--    (Prisma doesn't know how to generate GENERATED ALWAYS columns natively)
--
-- ─────────────────────────────────────────────────────────────

ALTER TABLE inventory_items
  ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', title || ' ' || description)
      ) STORED;

CREATE INDEX inventory_items_search_idx ON inventory_items USING GIN(search_vector);

-- ─────────────────────────────────────────────────────────────
-- To use in search.service.ts, replace the OR block with:
--
-- const data = await prisma.$queryRaw`
--   SELECT * FROM inventory_items
--   WHERE search_vector @@ plainto_tsquery('english', ${query})
--   AND is_sold = false
--   ORDER BY is_promoted DESC, created_at DESC
--   LIMIT ${limit} OFFSET ${skip}
-- `;
