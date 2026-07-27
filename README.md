# 🔮 Scryable

> **A production-ready, full-stack monorepo built to modernize inventory keeping and customer discovery for local
second-hand video game stores.**

*Note: This repository is public for portfolio showcase purposes. It was built to solve a real-world retail inventory
problem while demonstrating scalable, maintainable, and modern software engineering practices.*

---

## 📖 The "Why"

I built Scryable out of a genuine need I recognized in my local retail space: second-hand shops like retro video game
stores often rely on outdated, cumbersome inventory systems. Most times there is no means for discovering inventory
outside social media posts, calling the store, or visiting in person.

Scryable provides a dual-sided solution:

1. **A robust management platform** for store owners to track stock, conditions, and pricing.
2. **A discovery tool** for customers to search local inventory in real-time.

Beyond the product itself, this codebase serves as a technical sandbox to keep my engineering skills sharp, applying
enterprise-grade architectural patterns to a modern TypeScript stack.

---

## 🏗️ System Architecture & Tech Stack

This project is structured as a **Yarn Workspace Monorepo**, ensuring strict boundaries between concerns while allowing
seamless code sharing across the stack.

### **Backend (`apps/api`)**

* **Runtime / Framework:** Node.js + Fastify 5
* **Database:** PostgreSQL 16
* **ORM:** Prisma 7 (using `@prisma/adapter-pg`)
* **Security:** JWT (Access/Refresh), bcrypt, Fastify Helmet & Rate Limiting

### **Frontends (`apps/web` & `apps/mobile`)**

* **Web:** React 19
* **Mobile:** React Native (0.81) + Expo 54 + Expo Router
* **Styling:** TailwindCSS & NativeWind

### **Shared Packages (`packages/shared`)**

* **Validation:** Zod (Single source of truth for API validation and frontend forms)
* **Types:** Strongly typed API contracts shared across the entire monorepo

---

[//]: # ()
[//]: # (## 📸 App Preview)

[//]: # (*&#40;Add 2-3 screenshots or a looping GIF here showing the mobile app UI and/or a terminal side-by-side with the API responding. Visuals are the #1 way to get people to keep reading!&#41;*)

[//]: # ()
[//]: # (---)

## 🚀 Key Technical Decisions

Here are a few technical decisions and architectural patterns I implemented to ensure scalability and 
developer ergonomics:

### 1. End-to-End Type Safety & Shared Validation

By extracting Zod schemas and TypeScript interfaces into `@scryable/shared`, the API's validation logic and the
frontend's form validation are perfectly synchronized. If a database column constraint changes, the entire stack—from
the database schema to the mobile UI—catches the error at compile time.

### 2. Deterministic Database Seeding

To ensure a reliable and reproducible local development experience, I built a custom seeding script (`prisma/seed.ts`)
that uses a stable PRNG (`mulberry32`) and UUIDv5 hashing. This ensures that every developer who runs the seed script
generates the exact same mock inventory, with the same IDs and conditions, making shared API testing (`requests.http`)
perfectly consistent.

### 3. Advanced Backend Patterns

* **Lazy Singleton DB Proxy:** To bypass Node.js ES Module hoisting constraints (where imports run before `dotenv` can
  load environment variables), I implemented a lazy-loaded Proxy for the Prisma Client. This defers database
  initialization until the exact moment of the first query.
* **Service-Layer Ownership Authorization:** Routes are strictly presentation-layer. All authorization and
  resource-ownership checks (e.g., verifying a user owns the store they are trying to modify) are enforced at the
  service layer to prevent privilege escalation vulnerabilities.
* **Global Error Handling:** Fastify hooks catch and normalize Prisma errors, JWT failures, and custom `AppError`
  subclasses into clean, consistent HTTP responses.

### 4. Modern React Native Architecture (Expo Router)

The mobile application (`apps/mobile`) eschews legacy imperative routing in favor of **Expo Router**. This file-based
routing approach not only significantly improves code organization and developer experience, but it also natively
supports deep linking out-of-the-box; a crucial feature for a retail discovery app where users share links to specific
inventory items.

### 5. High-Performance Mobile UI (Reanimated & NativeWind)

To ensure the mobile app feels truly native, I prioritized UI-thread performance over JavaScript-bridge reliant
animations:

* **UI-Thread Animations:** Leveraging `react-native-reanimated` alongside `@gorhom/bottom-sheet` and gesture handlers
  to ensure complex interactive elements (like swipeable modal sheets and transitions) run at a buttery-smooth 60/120fps
  without blocking the JS thread.
* **Unified Styling System:** Using `NativeWind` (TailwindCSS for React Native), allowing the web and mobile
  applications to share a consistent design token system and styling methodology.

---

## 🗺️ Roadmap & Future Work
While the core inventory and discovery loops are functional, the architecture was designed to accommodate the following upcoming features:
* **Advanced Full-Text Search:** Upgrading the current basic SQL `ILIKE` search to use a PostgreSQL `tsvector` index for fast, weighted full-text search across game titles and platforms.
* **AI-Powered Item Identification:** Integrating a vision model API to allow store owners to quickly scan and auto-categorize trade-ins simply by snapping a picture of the cartridge or box.
* **Proximity Wishlists & Push Notifications:** Allowing users to "wishlist" highly sought-after retro games. This will leverage Expo Push Notifications and PostgreSQL geo-spatial queries (PostGIS) to alert users the moment a nearby store logs the item into inventory.
* **Image Uploads:** Integrating `@fastify/multipart` and cloud storage (Supabase/Cloudinary) for store owners to upload pictures of specific item conditions.
* **Refresh Token Rotation:** Moving from stateless refresh tokens to database-persisted tokens with automatic invalidation upon reuse to enhance security.

---

## 🛠️ Local Development

### Prerequisites

- Node.js >= 18
- Yarn 4 (Corepack)
- Docker Desktop (for PostgreSQL)

### Getting Started

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start the Database**
   ```bash
   docker run --name scryable-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=scryable -p 5432:5432 -d postgres:16
   ```

3. **Setup Environment**
   Duplicate `apps/api/.env.example` to `apps/api/.env` and update the variables if necessary.

4. **Migrate & Seed**
   ```bash
   yarn workspace @scryable/api db:generate
   yarn workspace @scryable/api db:migrate
   yarn workspace @scryable/api db:seed
   ```

5. **Run the API**
   ```bash
   yarn workspace @scryable/api dev
   ```

*(Check individual app READMEs for specific Web and Mobile startup instructions).*

---

### Copyright & License

&copy; 2026 McKay Larsen. All rights reserved.

*This code is provided publicly for portfolio and job-search review only. No unauthorized reproduction, modification, or
commercial use is permitted.*
