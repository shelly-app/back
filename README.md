# Pet Shelter Management API

A backend API for managing a pet shelter system built with Express.js, TypeScript, and PostgreSQL.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version specified in `.tool-versions`)
- [pnpm](https://pnpm.io/) (v10.14.0 or higher)
- [Docker](https://www.docker.com/) (for running PostgreSQL and LocalStack)
- [Docker Compose](https://docs.docker.com/compose/)

## Architecture Overview

This application uses Docker Compose to run a local development environment that mirrors AWS infrastructure:

| Local Service | AWS Equivalent | Purpose | Local Status |
|---------------|----------------|---------|--------------|
| PostgreSQL (Docker) | Amazon RDS | Database | ✅ Fully functional |
| LocalStack S3 | Amazon S3 | File storage for pet photos | ✅ Fully functional |
| Authentication Bypass | Amazon Cognito | User authentication | ⚠️ Mocked (see below) |

### Authentication in Local Development

**By default, authentication is disabled** in local development for convenience. The app automatically injects a test user for all requests.

- **Local Mode**: `DISABLE_AUTH=true` - Authentication bypassed with a test user
- **Production Mode**: `DISABLE_AUTH=false` - Real AWS Cognito authentication required

**Note**: AWS Cognito requires LocalStack Pro (paid). For local development, we use an authentication bypass. See [AUTHENTICATION_TESTING.md](./AUTHENTICATION_TESTING.md) for how to test authentication with real AWS Cognito.

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

### 4. Start Docker Services

Start PostgreSQL and LocalStack using Docker Compose:

```bash
pnpm db:up
```

This command starts:
- **PostgreSQL 16** on port 5432
- **LocalStack** on port 4566 (S3 service)

The LocalStack initialization script will automatically create the `pet-photos` S3 bucket.

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

**Note**: Authentication is disabled by default (`DISABLE_AUTH=true`). All endpoints are accessible without tokens during local development.

## Quick Start (All-in-One)

Run the database setup and start the development server in one command:

```bash
pnpm dev
```

This command will:
1. Start PostgreSQL and LocalStack (S3)
2. Run database migrations
3. Start the development server with authentication disabled

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

## Authentication Testing

### Local Development (Default)

Authentication is **disabled by default** for faster development:

- No JWT tokens required
- All requests use a test user automatically
- Perfect for developing business logic

### Testing Authentication

When you need to test authentication:

1. Set up a real AWS Cognito User Pool (see [AUTHENTICATION_TESTING.md](./AUTHENTICATION_TESTING.md))
2. Update `.env`: `DISABLE_AUTH=false`
3. Get a test token: `./scripts/get-cognito-token.sh`
4. Use the token in requests: `Authorization: Bearer <token>`

See the [Authentication Testing Guide](./AUTHENTICATION_TESTING.md) for comprehensive testing strategies.

## LocalStack Services

### Accessing LocalStack S3

LocalStack S3 is accessible at `http://localhost:4566`:

- **S3 Bucket:** `pet-photos` (automatically created)
- **Endpoint:** `http://localhost:4566` (configured in `.env`)

### Verifying LocalStack Setup

Check that all services are running:

```bash
docker ps
```

You should see:
- `express-postgres` (PostgreSQL)
- `express-localstack` (LocalStack)

View LocalStack logs:

```bash
docker logs express-localstack
```

## Deploying to AWS

When you're ready to deploy to production AWS:

### 1. Set Up AWS Resources

Create the following AWS resources:

- **RDS PostgreSQL Database**
  - Note the endpoint URL
  - Ensure security groups allow your application access

- **S3 Bucket**
  - Create a bucket for pet photos
  - Configure appropriate IAM permissions

- **Cognito User Pool**
  - Create a user pool with email authentication
  - Create an app client
  - Note the User Pool ID and Client ID

### 2. Update Environment Variables

Update your production `.env` file:

```bash
NODE_ENV="production"

# CRITICAL: Authentication MUST be enabled in production
DISABLE_AUTH="false"

# AWS Credentials (use IAM role in production, not hardcoded keys)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="<your-aws-access-key>"
AWS_SECRET_ACCESS_KEY="<your-aws-secret-key>"

# Database (RDS)
DATABASE_URL="postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/dbname"

# S3 (remove the endpoint to use real AWS S3)
AWS_S3_BUCKET_NAME="your-production-bucket-name"
# AWS_S3_ENDPOINT=""  # Remove or leave empty for production

# Cognito (real AWS Cognito - REQUIRED)
AWS_COGNITO_USER_POOL_ID="us-east-1_YourPoolID"
AWS_COGNITO_CLIENT_ID="YourClientID"
```

### 3. Build and Deploy

```bash
pnpm build
pnpm start:prod
```

**Security Note:** In production, use IAM roles and AWS Secrets Manager instead of hardcoding credentials in `.env` files.

## Stopping the Application

To stop the development server, press `Ctrl+C` in the terminal.

To stop the database:

```bash
pnpm db:down
```

## Troubleshooting

### Port Already in Use

If port 8080, 5432, or 4566 is already in use:
- Update the `PORT` in `.env` for the application
- Stop the conflicting service
- For Docker ports, stop other containers using those ports

### Database Connection Issues

Ensure Docker is running and the PostgreSQL container is healthy:

```bash
docker ps
```

You should see both `express-postgres` and `express-localstack` containers running.

### LocalStack Not Initializing

If LocalStack services aren't ready:

1. Check LocalStack logs:
   ```bash
   docker logs express-localstack
   ```

2. Restart LocalStack:
   ```bash
   docker restart express-localstack
   ```

3. If issues persist, recreate containers:
   ```bash
   pnpm db:down
   docker volume rm back_localstack_data
   pnpm db:up
   ```

### Authentication Errors

**"Authentication not configured" error**

This happens when `DISABLE_AUTH=false` but Cognito credentials are missing.

**Solution:**
```bash
# For local development, use auth bypass:
DISABLE_AUTH="true"

# For testing with real Cognito:
DISABLE_AUTH="false"
AWS_COGNITO_USER_POOL_ID="your-pool-id"
AWS_COGNITO_CLIENT_ID="your-client-id"
```

See [AUTHENTICATION_TESTING.md](./AUTHENTICATION_TESTING.md) for complete authentication setup.

### Migration Issues

To reset the database and rerun migrations:

```bash
pnpm db:down
pnpm db:up
pnpm db:migrate
```

### S3 Upload Issues

If photo uploads fail:

1. Verify LocalStack S3 is running:
   ```bash
   docker exec express-localstack awslocal s3 ls
   ```

2. Check that `AWS_S3_ENDPOINT` is set in `.env`:
   ```bash
   AWS_S3_ENDPOINT="http://localhost:4566"
   ```

### Complete Reset

To completely reset your local environment:

```bash
# Stop all services
pnpm db:down

# Remove all volumes (WARNING: This deletes all data)
docker volume rm back_postgres_data back_localstack_data

# Restart everything
pnpm db:up
# Update .env with new Cognito credentials from logs
pnpm db:migrate
pnpm start:dev
```
