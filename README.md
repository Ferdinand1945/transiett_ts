# Transiett — Voucher campaigns

Kodtest för Transiett: app för vouchers och campaigns, byggd med Next.js och Next.js API Routes (jag valde inte Nest eller Express eftersom jag tyckte det skulle bli för mycket), Tailwind CSS och Sequelize för SQL. Grundläggande enhetstester med Vitest. Playwright är installerat för E2E, men jag har inte skrivit några tester för det än.

## Quick start (local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local` (or `.env`) in the project root:

```env
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=db_pass
DATABASE_NAME=transiett_db
```

Optional for `npm run db:init` when the database does not exist yet:

```env
DATABASE_ADMIN_DB=postgres
```

### 3. Initialize the database

Runs `db_schema/init.sql` (tables + seed campaigns). Skips if tables already exist.

```bash
npm run db:init
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
docker compose up --build
```

| Service    | URL / access |
|-----------|----------------|
| App       | http://localhost:3000 |
| Postgres  | `localhost:5432` — user `postgres`, password `postgres`, DB `transiett_db` |

On a **fresh** Postgres volume, `db_schema/init.sql` runs automatically on first boot. To reset and re-seed:

```bash
docker compose down -v && docker compose up --build
```

## Tests

Unit and component tests (no database required):

```bash
npm run test:run
npm run test
```
