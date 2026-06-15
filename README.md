# Game Sale Next

Next.js storefront + Strapi 5 backend for a Steam-like game shop.

## Frontend

```bash
npm install
copy .env.example .env.local
npm run dev
```

Frontend: http://localhost:3000

For local HTTP auth keep `AUTH_COOKIE_SECURE=false`. In production behind HTTPS set it to `true`.

## Strapi 5

```bash
cd backend
npm install
copy .env.example .env
npm run develop
```

Strapi: http://localhost:1337/admin

## Catalog data

Games, DLC and editions are read from Strapi. Keep `SEED_DATABASE=false` during normal startup.

For an existing database created by an older project version, run the one-time migration:

```bash
npm run strapi:catalog:migrate
```

It creates the draft/published documents required by Strapi 5 Content Manager and stores the local media paths in the game records. The command is safe to run again.

To create a new development database from the bundled catalog definitions, use `npm run strapi:seed`, stop Strapi after completion, then return `SEED_DATABASE=false`.

Optional dev user:

```env
SEED_TEST_USER_EMAIL=demo@gamesale.local
SEED_TEST_USER_PASSWORD=Password123
```

## Payment

The default provider is `mock`. It creates a pending order in Strapi and redirects to the local success/fail pages. Real card data is never collected or stored by this project. To connect a real provider, implement it behind the Strapi payment controller/service and keep secret keys in `backend/.env`.
