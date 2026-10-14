# Scryable Specification Document

**Project:** Scryable  
**System Type:** Full-Stack Monorepo Application  
**Domain:** Inventory discovery & management platform for second-hand retro video game stores  
**Monorepo Tooling:** Yarn 4 (Berry) Workspaces + TypeScript

---

## 1. Executive Summary & System Overview

**Scryable** is a comprehensive, multi-tenant inventory discovery and management platform designed specifically for the retro video game market. It bridges the gap between physical retail locations and digital shoppers by allowing local game stores to digitize their inventory, while providing collectors with powerful tools to discover, track, and reserve highly sought-after items.

### 1.1 Core Objectives & Key Features
The platform serves three primary audiences—Store Owners, Registered Collectors, and Guest Shoppers—governed by a secure, role-based administration system.

**For Store Owners & Staff (Merchant Portal):**
  -   **Streamlined Inventory Management:** Manage storefront profiles and active inventory catalogs with support for bulk uploads and Point of Sale (POS) webhook synchronization.
  -   **AI Image Search & Market Intelligence:** Photograph incoming stock with the mobile app; an AI image search identifies every item in the picture and returns its catalog details (title, platform, category, condition, price) for staff to review, edit, and verify before it is added to inventory. Integrated market pricing suggestions (e.g., PriceCharting) inform the proposed prices.
  -   **Customer Engagement:** Receive and manage digital "Hold Requests" for in-store pickup and promote rare items to the top of local discovery feeds.

**For Collectors & Shoppers (Mobile & Web Clients):**
  -   **Advanced Search & Discovery:** Search a global catalog with typo-tolerant full-text search and filter by platform, category, and condition.
  -   **Location-Based Hunting:** Discover nearby verified stores and browse their active public inventory.
  -   **Wishlists & Alerts:** Maintain personal wishlists and receive automated push/email notifications when sought-after items hit the shelves of favorited or local stores.
  -   **Social & P2P Trading:** Digitize personal collections, share them with a network of trusted friends, and initiate peer-to-peer trade inquiries backed by a community reputation system.

**For Platform Administrators:**
  -   **Trust & Safety:** A robust moderation dashboard to verify legitimate physical stores (granting them a "Verified" badge), manage store reviews, and suspend fraudulent users or counterfeit listings.

### 1.2 Technical Stack
Scryable is engineered for high performance, cross-platform consistency, and strict type safety, utilizing a modern JavaScript/TypeScript ecosystem organized within a Yarn 4 (Berry) Monorepo.

**Backend & Data Architecture:**
*   **API Framework:** Node.js with **Fastify**, fortified by `@fastify/helmet` and `@fastify/rate-limit` for security and abuse prevention.
*   **Database & ORM:** **PostgreSQL** managed via **Prisma ORM**. It utilizes GIN indexes and `tsvector` for high-performance full-text search, alongside geospatial indexing for radius-based queries.
*   **Authentication & IAM:** **Better Auth** handling secure, stateless session management, role-based access control (RBAC), magic links, and OAuth integrations.
*   **Caching:** **Redis** for in-memory caching of high-traffic read operations and global discovery feeds.

**Frontend Applications:**
*   **State Management & Resilience:** **TanStack React Query** is used across all clients for caching, offline resilience, and graceful degradation.
*   **Mobile Client (iOS & Android):** Built with **React Native** and **Expo**, utilizing **Expo Router** for deep-linking. The UI is fluidly animated via `react-native-reanimated` and styled using **NativeWind** (Tailwind CSS) and **React Native Reusables**.
*   **Web Client (Merchant & User Portal):** Built using **React Router (v7 in framework mode)**, utilizing **Shadcn UI** components and **Tailwind CSS** to share design tokens and provide a cohesive experience matching the mobile app.

---

## 2. Monorepo Architecture & System Layers

The project utilizes a multi-layered architecture managed via **Yarn Berry (v4)** workspaces. This structure enforces a strict separation of concerns between the presentation clients, the business logic/API, and the data access layer, while sharing core domain models and validation schemas through a unified TypeScript environment.

### 2.1 Presentation Layer (Clients)
The presentation layer is split into two distinct applications optimized for their respective platforms. Both clients utilize **TanStack React Query** for asynchronous state management, providing built-in caching, offline resilience, and graceful degradation.

**Mobile Client (`apps/mobile`):**
  *   **Technology:** React Native (v0.86), React 19.2, and Expo SDK 57.
  *   **Routing:** Expo Router for file-based routing and seamless deep-linking.
  *   **UI/UX:** Styled using NativeWind (Tailwind CSS for React Native) and React Native Reusables. It leverages `react-native-reanimated` and `react-native-gesture-handler` to ensure fluid, interruptible, 60 FPS native animations and gestures.

**Web Client (`apps/web`):**
  *   **Technology:** React Router v7 (running in Full-Stack Framework Mode).
  *   **UI/UX:** Constructed using Tailwind CSS and Shadcn UI, providing a cohesive design system and shared design tokens that mirror the mobile application.
  *   **Role:** Acts as the primary Merchant Portal for store owners (facilitating bulk uploads and POS integrations) and a responsive web catalog for desktop shoppers.

### 2.2 API & Application Layer (`apps/api`)
A centralized, high-performance RESTful API serving both the web and mobile clients.
*   **Core Framework:** Node.js with **Fastify** (v5). Chosen for its low overhead, native schema-based routing, and high throughput.
*   **Identity & Access Management:** Powered by **Better Auth**. This dedicated authentication layer handles secure session management, OAuth integrations (e.g., Google, Discord), Magic Links, and Role-Based Access Control (RBAC) across the platform.
*   **Security & Middleware:** Enforces strict HTTP boundaries via `@fastify/helmet` (CSP, HSTS) and protects against abuse and brute-force attacks using targeted IP-based `@fastify/rate-limit` thresholds.

### 2.3 Data Access Layer
*   **ORM & Persistence:** **Prisma** acts as the Object-Relational Mapper interfacing with a **PostgreSQL 16** database. It ensures type-safe database queries that perfectly align with the shared DTOs in `@scryable/shared`.
*   **Search Engine:** Utilizes PostgreSQL's native `tsvector` and GIN indexing for high-performance, typo-tolerant full-text search across the inventory catalog.

### 2.4 Workspace Structure & Dependency Graph

```text
scryable/
├── package.json               # Root monorepo workspace configuration & orchestration scripts
├── packages/
│   └── shared/                # Core domain types, Enums, DTOs, and Zod schemas
└── apps/
    ├── api/                   # Fastify + Prisma + PostgreSQL + Better Auth REST API
    ├── mobile/                # Expo / React Native Client
    └── web/                   # React Router v7 Web Client
```

```text
      ┌─────────────────────────┐
      │     @scryable/shared    │
      │   (Types & Validations) │
      └────────────┬────────────┘
                   │
         ┌─────────┼─────────────────────┐
         ▼         ▼                     ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ apps/api    │  │ apps/mobile │  │ apps/web    │
│ (Fastify)   │  │ (Expo)      │  │ (React Rtr) │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 3. Functional Requirements

### 3.1. Platform Administration (Super Admin)
A dedicated set of features for platform owners and administrators to govern the application, ensure safety, and manage the ecosystem.
* **Moderation Dashboard:** An interface to review flagged items, ban malicious users, or suspend fraudulent stores.
* **Store Verification:** A feature to manually or automatically verify legitimate brick-and-mortar stores (e.g., via business licenses or physical location checks) and grant them a "Verified" badge to help them stand out from casual resellers.
* **System-Wide Role Management:** Utilize Better Auth to strictly enforce role-based access control (RBAC) across the platform, distinguishing between Super Admins, Store Owners, Store Staff, and standard Users.

### 3.2. Store Requirements (Owners/Managers)
These features are gated behind authentication and authorized only for users designated as the owner, manager, or staff of the respective store.
* **Authentication & Authorization:**
  * Store owners must be authenticated via Better Auth and only have access to modify the inventory of the specific store(s) they manage.
  * **Staff Roles:** Owners can invite employees with a restricted "Staff" role, allowing them to manage inventory and process holds without the ability to delete the store or alter payout settings.
* **Core Inventory Management:**
  * **CRUD Operations:** Store managers must be able to add, update, and remove items from their active inventory.
  * **Promotions:** Managers can flag specific high-value or rare items as "Promoted" to increase their visibility in search results and local feeds.
* **AI Image Search for Inventory Intake:**
  * Store staff photograph one or more items (e.g., game cartridges, consoles, accessories) with the mobile app's camera and confirm the photo is usable (retaking it if needed) before it is sent.
  * The API runs an AI image search over the photo and returns an array of every item it identifies, each carrying the catalog fields stored for an inventory item (title, description, platform, category, condition, price, image URLs).
  * Staff review the returned items, correct any field, discard false matches, and explicitly verify each item. Only verified items are submitted, and each is validated against the shared `createItemSchema` before it is written to the store's inventory.
  * Access is restricted to users who manage the store's inventory (the store's `owner` and `staff`) and platform `admin`s.
* **Pricing Intelligence:**
  * During item creation or updating, the system will fetch and display pricing suggestions using integrations from trusted sources like pricecharting.com based on the identified item and its condition.
* **Hold Management:**
  * Managers receive and can review "Hold" requests from users, with the ability to accept, decline, or set an expiration timer on the requested hold.
* **Enhanced Store Management:**
  * **Bulk Inventory Operations:** Allow store owners to upload a CSV or Excel file to bulk-add or bulk-update inventory, which is crucial for stores handling hundreds of items simultaneously.
  * **Basic Analytics Dashboard:** Provide store owners with insights on their inventory performance, such as how many times an item was viewed, how many users wishlisted a specific item, and hold request fulfillment rates.
  * **POS/Webhooks Integration:** Provide an API key or webhook system for stores to sync their physical Point of Sale (POS) system with the platform, ensuring items are automatically marked as `isSold: true` when bought in-store.

### 3.3. User Requirements (Registered Collectors/Shoppers)
Registered users have profiles and access to personalized tracking, social features, and advanced purchasing workflows.
* **Advanced Authentication & Security (via Better Auth):**
  * **Social OAuth Logins:** Users can create accounts instantly using platforms popular with gamers (e.g., Discord, Google, Apple).
  * **Passwordless/Magic Links:** Allow users to log in via an email link to reduce friction.
  * **Session Management:** Users can view active sessions and remotely log out of other devices.
* **Search & Discovery:**
  * **Global & Filtered Search:** Users can search the entire platform's inventory and filter by category, platform, condition, and distance.
  * **Fuzzy/Typo-Tolerant Search:** The search engine must handle common misspellings (e.g., "Playstaion") so users don't miss matching inventory.
  * **Saved Searches & Alerts:** Users can save specific search parameters (e.g., "Condition: CIB, Platform: N64, Max Price: $50") and receive automated digests of new matching inventory.
* **Store Interactions & Trust:**
  * **Favorites:** Users can "favorite" specific stores to prioritize their inventory in feeds.
  * **Hold Requests:** Users can submit a "hold request" for an item to reserve it for local pickup for a limited time.
  * **Store Ratings & Reviews:** Users can rate verified stores based on their experience (e.g., item condition accuracy, reliability) to build a community Trust Score.
* **Personal Collection Management:**
  * **Library:** Users can digitize and track their personal inventory/collection of items.
  * **Wishlists & Notifications:** Users can add specific items to a wishlist. The system automatically sends a push notification or email when a wishlisted item is added to the inventory of a "favorited" or nearby store.
* **Peer-to-Peer (P2P) & Social:**
  * **Social Network:** Users can add trusted individuals or "friends" to browse their personal collection libraries.
  * **Trade Inquiries:** Users can initiate trade requests or messages regarding items in a friend's collection.
  * **P2P Trade Reputation:** A reputation rating system (e.g., thumbs up/down) to prevent scams and establish trusted traders.
* **Trust & Safety:**
  * **Reporting System:** Users can flag items that violate terms (e.g., counterfeit items, inappropriate images) for platform administrators to review.

### 3.4. Guest Requirements (Unregistered Visitors)
Guests are transient visitors interacting with the platform without an account. Their primary goal is discovery and conversion.
* **Global Search & Discovery:**
  * Guests can search and view all public store inventory across the platform.
* **Local Discovery:**
  * Guests can provide a location (e.g., zip code or GPS permission) to discover nearby stores, viewing their public hours, details, and active inventory.
* **Conversion Funnel:**
  * If a guest attempts to perform a registered action (e.g., favorite a store, place an item on hold, or add to a wishlist), they will be prompted to create an account or log in, leveraging the low-friction Better Auth OAuth or Magic Link options to ensure a smooth transition.

---

## 4. Non-Functional Requirements

### 4.1. Performance
* **API Response Times:** Standard REST API endpoints (Fastify) must respond within 200ms under normal load to ensure a snappy user experience.
* **Search Optimization:** As the catalog grows, search queries must remain highly performant (sub-200ms) by migrating to PostgreSQL full-text search (`tsvector` + GIN indexes) rather than relying on standard `ILIKE` clauses.
* **Mobile UI Rendering:** The React Native mobile application must maintain a consistent 60 FPS. Complex animations and transitions (like the Filter Drawer) must utilize `react-native-reanimated`, `react-native-worklets`, and `@gorhom/bottom-sheet` to ensure they run on the UI thread and do not block the JS thread.
* **Infinite Scrolling:** The mobile item feed must seamlessly load paginated data using a `FlatList` with a pre-fetch threshold (e.g., `onEndReached` threshold of 0.5) so the user rarely experiences a hard stop waiting for network requests.
* **Caching Strategy:** High-traffic, read-heavy operations (e.g., fetching platform categories or global discovery feeds) should utilize an in-memory caching layer (like Redis, as noted in the roadmap) to reduce PostgreSQL database load.

### 4.2. Security
* **Identity & Session Management:** Implement secure, stateless or database-backed session management using `better-auth` for OAuth, magic links, and standard credentials.
* **Network & Transport Security:** The Fastify API must enforce strict HTTP headers via `@fastify/helmet` (including CSP, HSTS, frameguard, and noSniff) to mitigate cross-site scripting and clickjacking attacks.
* **Abuse Prevention & Throttling:** The API must utilize `@fastify/rate-limit` based on IP addresses. Standard endpoints should be capped (e.g., 100 requests/minute), while sensitive endpoints (like Authentication or 404 scanning) must have stricter thresholds (e.g., 4-10 requests/15 minutes) to prevent brute-force attacks and scraping.
* **Strict Boundary Validation:** All incoming API payloads and outbound responses must be validated at runtime against strict Zod schemas defined in `@scryable/shared` to prevent injection attacks and ensure data integrity.

### 4.3. Reliability
* **Server-Side Lifecycle & Degradation:** The Fastify server must intercept `SIGTERM` and `SIGINT` signals to perform a graceful shutdown. It must finish processing in-flight requests and cleanly disconnect the Prisma database pool to prevent data corruption.
* **Client-Side Resilience (TanStack Query):** Both the Mobile and Web frontends must utilize TanStack React Query for asynchronous state management. This simplifies client-side graceful degradation by automatically handling network retries, background data synchronization (stale-while-revalidate), offline caching, and unified error handling when the API is unreachable or slow.
* **Data Integrity:** The PostgreSQL database must enforce strict relational constraints (e.g., cascading deletes when a store is removed, so orphaned inventory items do not pollute the platform).
* **System Health Monitoring:** The API must expose a highly available `/health` endpoint to allow orchestration tools to monitor uptime and automatically restart unhealthy containers.

### 4.4. Maintainability
* **Monorepo Consistency:** The system must strictly adhere to the Yarn 4 (Berry) workspace architecture. All domain types, interfaces, enums, and Zod schemas must reside entirely within `@scryable/shared` to guarantee contract consistency across the Fastify API and the Expo mobile client.
* **Type Safety:** The entire codebase must enforce strict TypeScript compilation. CI/CD pipelines must run `yarn typecheck` (`tsc --noEmit`) and prevent the merging of code with type errors.
* **Observability & Tracing:** The API must utilize `pino` for logging. In development, logs should use `pino-pretty`; in production, they must be structured JSON. Every request must be tagged with a unique correlation ID (`x-request-id` or UUID) that travels through the logs to simplify debugging.
* **Database Migrations:** All database schema alterations must be managed programmatically via Prisma migrations (`prisma migrate`) to ensure environments can be reliably recreated and rolled back.

### 4.5. User Experience / UX
* **Design System Consistency:** The platform must maintain a cohesive visual identity across both platforms using utility-first styling and robust component libraries:
  * **Mobile App:** Must utilize **React Native Reusables** alongside **NativeWind** (Tailwind CSS for React Native) to ensure a consistent, accessible, and native-feeling mobile UI.
  * **Web App:** Must be built using **React Router** (in framework mode), utilizing **Shadcn UI** components and **Tailwind CSS** to build a highly interactive merchant and user portal that shares design tokens with the mobile app.
* **Cross-Platform Parity:** Navigation must be handled predictively via Expo Router (Mobile) and React Router (Web) to support deep-linking (e.g., sharing a link to a specific retro game that opens seamlessly on either platform).
* **Fluid & Interruptible Interactions:** Gesture-based UI elements in the mobile app (such as swiping away the filter drawer) must use `react-native-gesture-handler` to feel natural and interruptible to the user.
* **Visual Feedback & Loading States:** Operations that require API calls must provide immediate UI feedback. Utilizing React Query's `isPending` and `isFetching` states, the applications should use skeleton loaders or localized spinners instead of full-screen blocking loaders whenever possible.

---

## 5. Workspace Profiles & Responsibilities

### 5.1 `packages/shared` (`@scryable/shared`)
The single source of truth for application contracts, data shapes, and runtime input validation.
- **Enums & Constant Sets:**
  - `PLATFORMS`: 28 console platforms covering 8-bit to 9th-generation consoles.
  - `CONDITIONS`: `sealed`, `cib`, `loose`, `fair`, `poor`.
  - `CATEGORIES`: `game`, `console`, `accessory`, `strategy-guide`, `merchandise`, `other`.
  - `ROLES`: `admin`, `owner`, `staff`, `user`.
- **Domain Interfaces & DTOs:**
  - `User`, `Store`, `InventoryItem`, `HoldRequest`, `StoreReview`.
  - `CreateItemDto`, `UpdateItemDto`, `SearchParams`, `PaginatedResponse<T>`.
- **Validation (Zod):**
  - Runtime request validation schemas mirroring API input expectations to ensure strict boundary validation before processing.

---

### 5.2 `apps/api` (`@scryable/api`)
High-performance RESTful API built on Fastify and Prisma ORM.

#### Technology Stack
- **Runtime & Language:** Node.js (>=18.0.0), TypeScript, `tsx` for execution and watch mode.
- **Web Framework:** Fastify v5 with native schema-based routing.
- **Persistence & ORM:** PostgreSQL 16 via Prisma ORM (using `@prisma/adapter-pg` and `pg` pool).
- **Identity & Access Management:** **Better Auth** handling authentication, session management, and OAuth via mounted API handlers.
- **Security & Reliability Plugins:**
  - `@fastify/helmet`: Strict HTTP headers (CSP, frameguard, HSTS, noSniff).
  - `@fastify/cors`: CORS controls configured for local and client origins.
  - `@fastify/rate-limit`: Global request throttling (100 req/min/IP), with targeted low-threshold rate-limiting on sensitive endpoints.
  - Custom structured error handler formatting domain exceptions.
  - Structured request logging with request correlation IDs (`x-request-id` or UUIDv4) via Pino.

#### Key API Modules
1. **Authentication (`/api/auth/*`)**:
   - Handled by Better Auth to provide robust session, OAuth, and credential management.

2. **Stores (`/api/stores`)**:
   - Store registration and retrieval, including radius-based geolocation search.
   - Store profile mutations restricted to verified store owners/staff via Better Auth RBAC.

3. **Store Inventory (`/api/stores/:storeId/items`)**:
   - Scoped CRUD operations for inventory items.
   - Bulk CSV/Excel inventory upload processing.
   - AI image search (`POST /api/stores/:storeId/inventory/identify`, planned) that identifies the items in an uploaded photo for staff-verified intake.

4. **Search & Discovery (`/api/search`)**:
   - Unauthenticated multi-store search powered by PostgreSQL full-text search (`tsvector` + GIN).
   - Multi-attribute filtering (platform, category, condition, price range, storeId).
   - Dynamic sorting prioritizing promoted listings.

---

### 5.3 `apps/mobile` (`@scryable/mobile`)
Cross-platform native mobile application targeting retro game enthusiasts.

#### Technology Stack
- **Framework:** React Native 0.86, React 19.2, Expo SDK 57 with Expo Router (v57, versioned with the SDK; file-based navigation), TypeScript 6.
- **Platform Targets:** iOS 16.4+ (SDK 57 minimum), built with Xcode 27. The UIKit scene lifecycle required by the iOS 27 SDK is enabled via `expo-build-properties` (`ios.enableSceneSupport`); this setting can be removed on SDK 58+, which includes scene support by default.
- **Data Fetching & State:** **TanStack React Query** for network resilience, caching, and offline state management.
- **Styling:** NativeWind (Tailwind CSS v3) + React Native Reusables for accessible, native-feeling UI components.
- **Gesture & Motion:** `react-native-gesture-handler`, `react-native-reanimated`, and `@gorhom/bottom-sheet`.
- **Camera:** `expo-camera` for still-photo capture during inventory intake (microphone and barcode scanning disabled).
- **Data Integration:** Typed HTTP client (`lib/api.ts`) leveraging types directly from `@scryable/shared`.

#### Core User Flows & UI Modules
0. **Home (`app/index.tsx`):**
   - Prominent search input that opens the Search screen with the query (or "Browse all inventory").
   - "Manage Inventory" section for store owners and staff, linking to Inventory Intake (the only store tool so far). Until sign-in exists, staff pick their store from the public store list; with Better Auth this becomes `GET /api/stores/mine`.
1. **Browse & Search (`app/search.tsx`):**
   - Live query input with triggerable search action.
   - Paginated infinite scroll via `FlatList` with optimistic UI feedback (skeletons/spinners) driven by React Query.
2. **Filter Drawer:**
   - Modal bottom sheet driven by `@gorhom/bottom-sheet`.
   - Filter taxonomy selection for Platform, Category, and Condition.
3. **Store & Item Details:**
   - Item detail (`app/item/[storeId]/[itemId].tsx`): photos, price, platform/category/condition, description, a "Sold by" link to the store, and a disabled "Place hold" placeholder until the Hold Requests API ships.
   - Store info (`app/store/[storeId]/index.tsx`): description, tappable address/phone/website, and the store's unsold inventory.
   - Deep links use the app's custom scheme today: `scryable://item/<storeId>/<itemId>` and `scryable://store/<storeId>`. Universal links (iOS) / App Links (Android) are deferred until the project has a web domain to host the association files.
4. **Inventory Intake (Store Staff, `app/store/[storeId]/inventory/add.tsx`):**
   - Camera permission flow, then a full-screen `expo-camera` capture view.
   - Photo review step: staff retake the picture or confirm it before anything is uploaded.
   - The confirmed photo is sent to the AI image search (React Query mutation); identified items are listed with skeleton loading and retry on failure.
   - Review & submit (next increment): edit each identified item, discard false matches, verify, and submit verified items to the store inventory.

---

### 5.4 `apps/web` (`@scryable/web`)
Responsive web portal serving both as the Merchant Dashboard for store owners and a desktop catalog for shoppers.

#### Technology Stack
- **Framework:** React Router v7 running in Full-Stack Framework Mode.
- **Data Fetching & State:** **TanStack React Query** integrated for client-side resilience and caching.
- **Styling:** Tailwind CSS combined with **Shadcn UI**, sharing design tokens with the mobile application.
- **Authentication Client:** `better-auth/react` client configured to interface securely with the API layer.

#### Core User Flows & UI Modules
1. **Merchant Portal (Gated):**
   - Advanced inventory management, bulk upload interfaces, and analytics dashboards for store owners and staff.
   - Hold request management queue.

2. **Web Catalog (Public/Shopper):**
   - High-fidelity desktop browsing experience for global discovery, wishlists, and P2P social collection viewing.

---

## 6. Data Architecture & Database Schema

The persistence layer uses PostgreSQL with strict relational constraints and indexing optimized for read-heavy inventory searches and location-based discovery. 

With the migration to `better-auth`, the schema is split between **Identity & Access Management (IAM)** and **Core Domain** tables.

### 6.1 Identity & Access Management (Better Auth)

To integrate `better-auth` properly, the database must include specific tables to manage users, OAuth accounts, active sessions, and verification tokens. 

| Table / Model | Field | Type | Description |
| :--- | :--- | :--- | :--- |
| **User** | `id` | String (UUID) | Primary Key |
| | `name` | String | User's display name |
| | `email` | String | User's unique email address |
| | `emailVerified` | Boolean | Whether the email has been verified |
| | `image` | String? | Optional avatar URL |
| | `role` | Enum (`admin`, `owner`, `staff`, `user`) | Platform access level (Scryable custom field) |
| | `createdAt` / `updatedAt`| DateTime | Standard audit timestamps |
| **Account** | `id` | String | Primary Key |
| | `userId` | String | Foreign Key to `User` |
| | `accountId` | String | Provider's account ID |
| | `providerId` | String | OAuth Provider (e.g., `google`, `discord`) |
| | `password` | String? | Hashed password (if using credentials) |
| | `accessToken` / `refreshToken` | String? | OAuth tokens |
| | `expiresAt` | DateTime? | OAuth token expiration |
| **Session** | `id` | String | Primary Key |
| | `userId` | String | Foreign Key to `User` |
| | `token` | String | Unique session token |
| | `expiresAt` | DateTime | Session expiration date |
| | `ipAddress` | String? | IP Address for security tracking |
| | `userAgent` | String? | Device/Browser info |
| **Verification** | `id` | String | Primary Key |
| | `identifier` | String | Email or phone number being verified |
| | `value` | String | The verification token/code |
| | `expiresAt` | DateTime | Token expiration date |

### 6.2 Core Domain Entities

The domain models manage the multi-tenant store architecture, inventory listings, and user interactions (holds, wishlists, reviews).

**Store**
Represents a physical retail location and its merchant profile.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `ownerId` | String | Foreign Key to `User` (Store Owner) |
| `name` | String | Store business name |
| `description` | String | Store bio or details |
| `address`, `city`, `state`, `zipCode` | String | Physical address components |
| `latitude` | Float? | Geolocation for local discovery |
| `longitude` | Float? | Geolocation for local discovery |
| `phone`, `website` | String? | Optional contact information |
| `isVerified` | Boolean | Super-admin toggle for trusted physical stores |

**InventoryItem**
Represents a specific item for sale in a store's catalog.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `storeId` | String | Foreign Key to `Store` |
| `title` | String | Item title |
| `description` | String | Item details/defects |
| `platform` | Enum (`Platform`) | Console generation (e.g., SNES, PS1) |
| `category` | Enum (`Category`) | e.g., Game, Console, Accessory |
| `condition` | Enum (`Condition`) | e.g., CIB, Loose, Sealed |
| `price` | Decimal (8,2) | Current listing price |
| `imageUrls` | String[] | Array of uploaded image URLs |
| `isPromoted` | Boolean | Flags item for priority in search |
| `isSold` | Boolean | Flags item as no longer available |

**HoldRequest**
Tracks a user's request to reserve a specific inventory item.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `userId` | String | Foreign Key to `User` (Shopper) |
| `inventoryItemId`| String | Foreign Key to `InventoryItem` |
| `storeId` | String | Foreign Key to `Store` |
| `status` | Enum | `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED` |
| `expiresAt` | DateTime? | Automatically clears hold after this time |

**WishlistItem**
Tracks items a user is hunting for to trigger automated local notifications.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `userId` | String | Foreign Key to `User` |
| `title` | String | Target item name (fuzzy match) |
| `platform` | Enum (`Platform`) | Target platform |
| `category` | Enum (`Category`) | Target category |
| `maxPrice` | Decimal (8,2)? | Optional price ceiling for alerts |

**StoreReview**
Supports the Trust & Safety score system for verified stores.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `userId` | String | Foreign Key to `User` (Reviewer) |
| `storeId` | String | Foreign Key to `Store` |
| `rating` | Int | Score from 1 to 5 |
| `comment` | String? | Optional text review |

### 6.3 Entity-Relationship Diagram (Logical)
```
text
┌───────────────┐       ┌───────────────┐
│    Account    │*─────1│     User      │
├───────────────┤       ├───────────────┤
│ id (PK)       │       │ id (PK)       │
│ userId (FK)   │       │ email (UQ)    │
│ providerId    │       │ role (Enum)   │
└───────────────┘       └───────┬───────┘
                                │ 1
┌───────────────┐               │
│    Session    │*─────1        │ has many
├───────────────┤               ▼ *
│ id (PK)       │       ┌───────────────┐       1       * ┌───────────────┐
│ userId (FK)   │       │     Store     │─────────────────│ InventoryItem │
│ token (UQ)    │       ├───────────────┤                 ├───────────────┤
└───────────────┘       │ id (PK)       │                 │ id (PK)       │
                        │ ownerId (FK)  │                 │ storeId (FK)  │
┌───────────────┐       │ address       │                 │ platform      │
│  HoldRequest  │*─────1│ lat / lng     │                 │ category      │
├───────────────┤       │ isVerified    │                 │ condition     │
│ id (PK)       │       └───────┬───────┘                 │ price         │
│ userId (FK)   │               │ 1                       │ isSold        │
│ itemId (FK)   │*──────────────┘                         └───────────────┘
│ status (Enum) │
└───────────────┘
```

### 6.4 Indexing & Performance Design
*   **`inventory_items(storeId)`**: Accelerates high-speed retrieval of store-specific catalogs.
*   **`inventory_items(platform, category)`**: Direct index acceleration for faceted search filters on the global discovery feed.
*   **`inventory_items(isSold)`**: Optimizes partial/filtered queries to exclude sold inventory from public listings.
*   **`stores(latitude, longitude)`**: Geospatial indexing (or standard composite index combined with bounding-box queries) to rapidly resolve local discovery searches based on user location.
*   **Composite sorting**: `ORDER BY isPromoted DESC, createdAt DESC` combined with pagination offsets ensures promoted listings are prioritized efficiently in broad search results.
*   **Full-Text Search Migration**: Moving from standard `ILIKE` to `tsvector` with a GIN index on `title` and `description` to handle typo-tolerant, high-performance catalog searches as the database scales.

---

## 7. API Endpoints & Design

Below is the API Endpoints Specification for the Scryable platform. It outlines the endpoints currently implemented in the workspace, detailing the expected payloads, responses, and potential errors, followed by a section outlining planned endpoints required by the system specification.

## _Implemented Endpoints_

### System & Health

#### `GET /health`
* **Description:** Used to check the health and uptime of the API.
* **Request:** None
* **Success Response (200 OK):**
```json
{
    "status": "ok",
    "timestamp": "2024-05-15T12:00:00.000Z"
  }
```

* **Error Responses:** None standard (500 on server failure).

### Authentication
*All Auth endpoints have strict rate limits to prevent brute-force attacks.*

#### `POST /api/auth/register`
* **Description:** Registers a new user account (e.g., store owner or standard user).
* **Request Body (JSON):**
```json
{
    "email": "owner@test.com",
    "password": "SecretPassword123!",
    "displayName": "Game Shop",
    "role": "owner"
  }
```

* **Success Response (201 Created):**
```json
{
    "user": {
      "id": "uuid-1234",
      "email": "owner@test.com",
      "displayName": "Game Shop",
      "role": "owner",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "jwt_token_string",
    "refreshToken": "jwt_refresh_token_string"
  }
```

* **Error Responses:**
  * `400 Bad Request`: Validation failed (e.g., invalid email).
  * `409 Conflict`: A record with this value (email) already exists.
  * `429 Too Many Requests`: Rate limit exceeded (5 attempts / 15 mins).

#### `POST /api/auth/login`
* **Description:** Authenticates a user and provisions session tokens.
* **Request Body (JSON):**
```json
{
    "email": "owner@test.com",
    "password": "SecretPassword123!"
  }
```

* **Success Response (200 OK):** *(Same as Register)*
* **Error Responses:**
  * `400 Bad Request`: Validation failed.
  * `401 Unauthorized`: Invalid email or password.
  * `429 Too Many Requests`: Rate limit exceeded (10 attempts / 15 mins).

#### `POST /api/auth/refresh`
* **Description:** Refreshes an expired access token using a valid refresh token.
* **Request Body (JSON):**
```json
{
    "refreshToken": "jwt_refresh_token_string"
  }
```

* **Success Response (200 OK):**
```json
{
    "accessToken": "new_jwt_token_string",
    "refreshToken": "new_jwt_refresh_token_string"
  }
```

* **Error Responses:**
  * `401 Unauthorized`: Invalid or expired refresh token.

### Stores

#### `GET /api/stores`
* **Description:** Retrieves a list of all stores globally. Public endpoint.
* **Success Response (200 OK):** Returns an array of Store objects.

#### `GET /api/stores/mine`
* **Description:** Retrieves stores owned by the currently authenticated user.
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):** Returns an array of Store objects belonging to the user.
* **Error Responses:** `401 Unauthorized`

#### `GET /api/stores/:id`
* **Description:** Retrieves details for a specific store.
* **Success Response (200 OK):** Returns a Store object.
* **Error Responses:** `404 Not Found`

#### `POST /api/stores`
* **Description:** Creates a new store. Owner access required.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body (JSON):**
```json
{
    "name": "Pixel Vault",
    "description": "Retro games and consoles",
    "address": "123 Main St",
    "city": "Portland",
    "state": "OR",
    "zipCode": "97201",
    "phone": "503-555-0100",
    "website": "https://pixelvault.example.com"
  }
```

* **Success Response (201 Created):** Returns the created Store object.
* **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (If not an owner).

#### `PATCH /api/stores/:id`
* **Description:** Updates a store's profile. Caller must own the store.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** Partial store object (e.g., just `description`).
* **Success Response (200 OK):** Returns the updated Store object.
* **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

#### `DELETE /api/stores/:id`
* **Description:** Deletes a store and cascades to delete all its inventory.
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (204 No Content):** Empty body.
* **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

### Inventory Items

#### `GET /api/stores/:storeId/items`
* **Description:** Retrieves all active inventory items for a specific store.
* **Success Response (200 OK):** Array of InventoryItem objects.

#### `GET /api/stores/:storeId/items/:id`
* **Description:** Retrieves a specific inventory item.
* **Success Response (200 OK):** InventoryItem object.
* **Error Responses:** `404 Not Found`.

#### `POST /api/stores/:storeId/items`
* **Description:** Adds a new item to a store's inventory.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body (JSON):**
```json
{
    "title": "Super Mario World",
    "description": "Complete in box",
    "platform": "SNES",
    "category": "game",
    "condition": "cib",
    "price": 49.99,
    "imageUrls": ["https://..."],
    "isPromoted": false
  }
```

* **Success Response (201 Created):** Returns the created InventoryItem.
* **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

#### `PATCH /api/stores/:storeId/items/:id`
* **Description:** Updates an inventory item (e.g., mark as sold).
* **Headers:** `Authorization: Bearer <token>`
* **Request Body (JSON):** Partial item schema, additionally accepting `"isSold": true`.
* **Success Response (200 OK):** Returns the updated InventoryItem.
* **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

#### `DELETE /api/stores/:storeId/items/:id`
* **Description:** Permanently removes an item from the store.
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (204 No Content):** Empty body.
* **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

### Global Search

#### `GET /api/search`
* **Description:** Searches and filters active (unsold) inventory platform-wide.
* **Query Parameters:** `query` (string), `platform` (enum), `category` (enum), `condition` (enum), `minPrice` (num), `maxPrice` (num), `storeId` (uuid), `page` (num, default: 1), `limit` (num, default: 20).
* **Success Response (200 OK):**
```json
{
    "data": [
      { "id": "...", "title": "Super Mario", "price": 49.99, "store": { "name": "Pixel Vault" } }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
```

* **Error Responses:** `400 Bad Request` (Invalid query parameters).

---

## _Planned Endpoints (To-Be-Implemented)_

The following functionality requires API endpoints to be developed:

### Hold Requests (User & Merchant Portal)
* **`POST /api/items/:itemId/holds`**: Submit a new hold request for an item (requires standard `user` auth).
* **`GET /api/holds/mine`**: Retrieve active holds placed by the authenticated user.
* **`GET /api/stores/:storeId/holds`**: Retrieve pending hold requests for a store (requires `owner`/`staff` auth).
* **`PATCH /api/stores/:storeId/holds/:holdId`**: Accept or decline a hold request (updates status to `ACCEPTED` or `DECLINED`).

### Wishlists & Personal Library (User Portal)
* **`POST /api/users/me/wishlist`**: Add a new parameter set (e.g., target title, platform, max price) to the user's wishlist for alerts.
* **`GET /api/users/me/wishlist`**: Retrieve current wishlist configurations.
* **`DELETE /api/users/me/wishlist/:id`**: Remove an item from the wishlist.
* **`GET /api/users/me/library`** and **`POST /api/users/me/library`**: Manage digital representations of personal physical collections.

### Store Trust & Reviews
* **`POST /api/stores/:storeId/reviews`**: Submit a 1-5 star review and comment for a verified store (requires `user` auth).
* **`GET /api/stores/:storeId/reviews`**: Paginated list of store reviews.

### Advanced Store Management (Merchant Portal)
* **`POST /api/stores/:storeId/inventory/bulk`**: Upload a CSV or Excel file to perform bulk insertion/updates of inventory.
* **`POST /api/stores/:storeId/inventory/identify`** *(new endpoint)*: AI image search for inventory intake.
  * **Auth:** Bearer session; restricted to the store's `owner`/`staff` and platform `admin`s (`403` otherwise).
  * **Request:** `multipart/form-data` with a single `image` file (JPEG/PNG).
  * **Success Response (200 OK):** `IdentifyItemsResponse` from `@scryable/shared` — an array of every item found in the picture, each with the inventory catalog fields:
    ```json
    {
      "items": [
        {
          "title": "Super Mario World",
          "description": "Cartridge, box and manual. Light shelf wear on the box.",
          "platform": "SNES",
          "category": "game",
          "condition": "cib",
          "price": 89.99,
          "imageUrls": []
        }
      ]
    }
    ```
  * **Error Responses:** `400` (missing/invalid image), `401`, `403`, `413` (image too large), `422` (image could not be processed). An image with no recognisable items returns `200` with `"items": []`.
  * **Notes:** The endpoint only identifies; it never writes inventory. Staff-verified items are created through `POST /api/stores/:storeId/items` (or the bulk endpoint).
* **`GET /api/utils/market-price`**: Fetch market pricing suggestions (e.g., PriceCharting proxy) based on Title + Platform + Condition.
* **`POST /api/webhooks/pos`**: Dedicated authenticated route to ingest Point-of-Sale events to automatically flag items as `isSold: true`.

### Moderation & Administration (Super Admin)
* **`GET /api/admin/reports`**: Fetch user-submitted reports for counterfeit items or fraudulent stores.
* **`PATCH /api/admin/stores/:storeId/verify`**: Manually toggle a store's `isVerified` status to grant them the verified badge.
* **`PATCH /api/admin/users/:userId/suspend`**: Suspend malicious users or scam accounts.

---

## 8. Backend Architecture: Services & Data Access

To ensure a clean separation of concerns, high maintainability, and strict end-to-end type safety, the API (`apps/api`) employs a layered architecture that decouples HTTP transport from business logic and database interactions.

### 8.1 Transport Layer (Fastify Routes)
The route handlers (`src/routes`) act strictly as the transport layer. Fastify is responsible for HTTP context, intercepting incoming payloads, enforcing middleware rules (like authentication), and validating inputs against shared Zod schemas. Once validated, Fastify delegates the clean, typed data to the service layer.

### 8.2 Business Logic Layer (Services)
All core domain logic resides in isolated service modules (e.g., `src/services/item.service.ts`, `src/services/store.service.ts`).
* **HTTP-Agnostic:** Services are entirely unaware of Fastify requests or HTTP headers. They accept pure TypeScript arguments, keeping the domain logic decoupled and highly testable.
* **Domain Rules Verification:** This layer enforces business rules before interacting with the database. For example, before deleting an inventory item or updating a store, the service verifies that the requesting user actually has ownership rights over that resource.
* **Data Orchestration:** Services manage complex data requirements, such as running parallel database queries (`Promise.all`) to optimize response times for search and pagination.

### 8.3 Data Access Layer (Prisma ORM)
Database interactions are abstracted and handled exclusively by **Prisma ORM** (`lib/prisma.ts`).
* **Tool Integration:** The API uses a proxy singleton pattern to instantiate a single `PrismaClient`. This efficiently manages the PostgreSQL connection pool across all service executions, preventing database connection exhaustion.
* **Primary Benefit:** Prisma provides completely type-safe database queries. The objects returned from the database are guaranteed by the TypeScript compiler to match the shared domain contracts expected by the application, eliminating runtime errors caused by mismatched data shapes.

---

## 9. Frontend Architecture: Feature-Based Modules

To ensure maintainability, scalability, and strict separation of concerns across the presentation layers, both the mobile (`apps/mobile`) and web (`apps/web`) clients utilize a **Feature-Based Directory Structure**. Rather than grouping files by technical type (e.g., placing all hooks in one folder and all components in another), the codebase is organized by business domains (features).

### 9.1 Feature-Based Directory Layout
Each client application follows a standardized layout where core routing and global components live at the root, while business logic is encapsulated within specific feature directories.
```text
src/
├── app/                  # Application entry points and routing configurations
├── components/           # Global, domain-agnostic UI components (e.g., Buttons, Inputs)
├── lib/                  # Generic utilities, formatters, and API client wrappers
└── features/             # Isolated business domain modules
    ├── admin/            # Platform moderation and store verification tools
    ├── auth/             # Identity, session, and role management
    ├── collections/      # Personal library and wishlist management
    ├── holds/            # Item reservation workflows
    ├── inventory/        # Merchant tools for catalog management
    ├── search/           # Global catalog discovery and filtering
    ├── social/           # P2P trading and community features
    └── stores/           # Storefront profiles and trust reviews
```
Within each feature directory, all necessary domain-specific code is co-located:
*   `api/`: Data-fetching logic (e.g., TanStack Query hooks, Fastify endpoint wrappers).
*   `components/`: UI components exclusively used by this feature.
*   `hooks/`: React hooks encapsulating the feature's specific business logic.
*   `stores/`: Local state management (e.g., Zustand or context) specific to the feature.

### 9.2 Benefits of Feature Isolation
*   **Clear Boundaries:** Developers can modify the `search` feature (e.g., changing the filter taxonomy) without risking side effects in the `inventory` management feature.
*   **Backend Alignment:** The frontend feature folders directly mirror the API route structures in `apps/api`, establishing a unified mental model across the full stack.
*   **Access Control Mapping:** Features often map directly to user roles. The `inventory` and `admin` modules are naturally gated for Store Owners and Admins, making route protection straightforward.

### 9.3 Routing Strategy
Routing across both clients acts as a "thin shell" layer. The routing files are responsible solely for capturing URL parameters and rendering the appropriate feature components, keeping the routing layer clean of heavy business logic.
*   **Mobile (Expo Router):** Uses file-based routing within the `apps/mobile/app/` directory. For example, the file `app/search.tsx` simply imports and renders the `<DiscoveryFeed />` and `<FilterSheet />` components from `@/features/search/components`.
*   **Web (React Router v7):** Runs in framework mode using `apps/web/app/routes/`. The route modules handle data loading (loaders/actions) by delegating to the `api/` handlers within the respective feature folder, and then render the feature's primary view component.

### 9.4 Consistent Styling & UI Design System
To achieve visual parity between the mobile app and the web portal, the monorepo utilizes a shared Tailwind CSS design system approach.
*   **Web Client UI:** Built with **Tailwind CSS** and **Shadcn UI**. This provides highly accessible, copy-pasteable components that form the foundation of the Merchant and User portals.
*   **Mobile Client UI:** Built with **NativeWind** (Tailwind CSS tailored for React Native) and **React Native Reusables** (a mobile component library modeled directly after Shadcn UI).
*   **The Benefit:** Both clients use identical Tailwind utility classes (e.g., `flex-row items-center bg-bg-elevated`). By sharing configuration tokens (like colors, spacing, and typography) across the monorepo, a developer can build a UI element on the web and confidently implement its twin on mobile with a nearly identical developer experience and guaranteed brand consistency.

---

## 10. Security & Cross-Cutting Concerns

| Concern | Implementation Strategy |
| :--- | :--- |
| **Authentication** | Powered by **Better Auth** for secure, database-backed or stateless session management. Supports multi-provider OAuth logins, passwordless Magic Links, and standard credentials. |
| **Authorization** | Strict Role-Based Access Control (RBAC) via Better Auth, distinguishing between Super Admins, Owners, Staff, and Users. Service-level domain rule checks enforce strict ownership rights for store catalog mutations. |
| **Input Validation** | Strict Zod parsing on API request payloads; unified schemas residing in `@scryable/shared` safeguard both client form submissions and API boundaries. |
| **Network & Transport** | Enforced HTTP headers via `@fastify/helmet` (CSP, HSTS). IP-keyed `@fastify/rate-limit` applies global throttling (e.g., 100 req/min) and strict limits on sensitive endpoints (e.g., 4-10 req/15 mins for auth) to prevent brute-forcing. |
| **Observability** | Pino logger configured with pretty-printing in development and structured JSON output for production. Requests are tagged with unique correlation IDs (`x-request-id` or UUID) propagating through logs for simplified debugging. |
| **Resilience & Lifecycle** | Server-side graceful shutdown hooks intercept `SIGTERM`/`SIGINT` to drain Fastify requests and safely disconnect Prisma pools. Client-side resilience, offline caching, and automatic network retries are handled by TanStack React Query. |

---

## 11. Monorepo Quality & Lifecycle Workflows

The monorepo provides root-level coordination across packages and applications:

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Run API** | `yarn api` | Starts Fastify server with `tsx watch` hot-reloading |
| **Run Mobile** | `yarn mobile` | Starts Expo dev server with Metro bundler |
| **Type Check** | `yarn typecheck` | Executes `tsc --noEmit` across all workspace projects |
| **Code Quality** | `yarn lint` | Runs workspace-level linter rules |
| **Database Sync**| `yarn workspace @scryable/api db:migrate` | Runs Prisma schema migrations |
| **Seed Data** | `yarn workspace @scryable/api db:seed` | Populates realistic retro store catalogs & mock users |

---

## 12. Architecture Recommendations & Roadmap

1. **Full-Text Search Enhancement:**  
The current search relies on SQL `ILIKE`/`contains: query, mode: 'insensitive'` on `title` and `description`. For larger catalogs, complete the migration to PostgreSQL full-text search (`tsvector` + GIN indexes) as outlined in the database design.
2. **Web Merchant Dashboard (`apps/web`):**  
Flesh out the responsive web portal using **React Router v7 (framework mode)** and **Shadcn UI** to allow shop owners to manage inventory via desktop, process bulk CSV uploads, and review analytics.
3. **Geo-Location Search & Radius Queries:**  
   The `Store` schema already supports `latitude` and `longitude`. The next step is to implement PostGIS or standard bounding-box radius queries in the Fastify API to power the "Stores near me" local discovery feed on the mobile client.
4. **AI Image Search & Pricing Integrations:**  
   Build the AI image search endpoint (`POST /api/stores/:storeId/inventory/identify`) on a third-party vision model, returning every item identified in a photo, and the `/api/utils/market-price` utility backed by market aggregators (like PriceCharting) to propose prices. The mobile inventory-intake page currently calls a client-side stub of the identify endpoint (`identifyItems` in `apps/mobile/lib/api.ts`) until it ships.
5. **Hold Requests & Wishlists Engine:**  
   Implement the planned API endpoints for inventory reservations (Holds) and create a background worker or database trigger system to dispatch notifications when new inventory matches user Wishlist parameters.
6. **POS Webhook Synchronization:**  
   Build out secure, authenticated ingestion routes (`/api/webhooks/pos`) to allow brick-and-mortar stores to sync physical sales with the digital platform in real-time.
7. **Caching Layer:**  
   Introduce Redis for caching common catalog lookups (e.g., active platform and category aggregates) and global search queries to reduce PostgreSQL load during high-traffic periods.
