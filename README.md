# Pet Shelter Management API

A backend API for managing a pet shelter system built with Express.js, TypeScript, and PostgreSQL.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version specified in `.tool-versions`)
- [pnpm](https://pnpm.io/) (v10.14.0 or higher)
- [Docker](https://www.docker.com/) (for running PostgreSQL database)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd back
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file by copying the template:

```bash
cp .env.template .env
```

The default values in `.env.template` are configured for local development and should work out of the box. Key variables include:

- `NODE_ENV`: Set to `development` for local development
- `PORT`: Server port (default: 8080)
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/express_db`)

### 4. Start the Database

Start the PostgreSQL database using Docker Compose:

```bash
pnpm db:up
```

This will start a PostgreSQL 16 container on port 5432.

### 5. Run Database Migrations

Apply database migrations to set up the schema:

```bash
pnpm db:migrate
```

### 6. Start the Application

For development with auto-reload:

```bash
pnpm start:dev
```

The API will be available at `http://localhost:8080`

## Quick Start (All-in-One)

Run the database setup and start the development server in one command:

```bash
pnpm dev
```

This command will:
1. Start the PostgreSQL database
2. Run migrations
3. Start the development server

## Available Scripts

- `pnpm start:dev` - Start development server with auto-reload
- `pnpm build` - Build the application for production
- `pnpm start:prod` - Start production server (requires build first)
- `pnpm test` - Run tests
- `pnpm test:cov` - Run tests with coverage
- `pnpm check` - Run code quality checks with Biome
- `pnpm db:up` - Start PostgreSQL database
- `pnpm db:down` - Stop PostgreSQL database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:migrate:down` - Rollback database migrations
- `pnpm db:setup` - Start database and run migrations
- `pnpm dev` - Full development setup (database + migrations + dev server)

## API Documentation

Once the application is running, you can access the interactive API documentation (Swagger UI) at:

```
http://localhost:8080/api-docs
```

## Production Deployment

To run in production mode:

1. Update your `.env` file:
   ```bash
   NODE_ENV="production"
   DATABASE_URL="<your-production-database-url>"
   ```

2. Build and start:
   ```bash
   pnpm build
   pnpm start:prod
   ```

## Stopping the Application

To stop the development server, press `Ctrl+C` in the terminal.

To stop the database:

```bash
pnpm db:down
```

## Troubleshooting

### Port Already in Use

If port 8080 or 5432 is already in use, update the `PORT` in `.env` or stop the conflicting service.

### Database Connection Issues

Ensure Docker is running and the PostgreSQL container is healthy:

```bash
docker ps
```

You should see the `express-postgres` container running.

### Migration Issues

To reset the database and rerun migrations:

```bash
pnpm db:down
pnpm db:up
pnpm db:migrate
```
