-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'user');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('NES', 'SNES', 'N64', 'GameCube', 'Wii', 'WiiU', 'Switch', 'GameBoy', 'GBA', 'DS', 'ThreeDS', 'Genesis', 'Saturn', 'Dreamcast', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'PSVita', 'Xbox', 'Xbox360', 'XboxOne', 'XboxSeriesX', 'Atari2600', 'TurboGrafx16', 'NeoGeo', 'Other');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('sealed', 'cib', 'loose', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('game', 'console', 'accessory', 'strategy_guide', 'merchandise', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "platform" "Platform" NOT NULL,
    "category" "Category" NOT NULL,
    "condition" "Condition" NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "imageUrls" TEXT[],
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "inventory_items_storeId_idx" ON "inventory_items"("storeId");

-- CreateIndex
CREATE INDEX "inventory_items_platform_idx" ON "inventory_items"("platform");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_items_isSold_idx" ON "inventory_items"("isSold");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
