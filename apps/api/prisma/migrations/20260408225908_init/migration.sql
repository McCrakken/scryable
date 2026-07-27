/*
  Warnings:

  - The values [DS,ThreeDS] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('NES', 'SNES', 'N64', 'GameCube', 'Wii', 'WiiU', 'Switch', 'GameBoy', 'GBA', 'NDS', 'N3DS', 'Genesis', 'Saturn', 'Dreamcast', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'PSVita', 'Xbox', 'Xbox360', 'XboxOne', 'XboxSeriesX', 'Atari2600', 'TurboGrafx16', 'NeoGeo', 'Other');
ALTER TABLE "inventory_items" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "public"."Platform_old";
COMMIT;
