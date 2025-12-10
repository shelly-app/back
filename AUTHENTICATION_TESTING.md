# Authentication Testing Guide

This guide explains how to test authentication in different environments, from local development to production.

## Table of Contents

- [Local Development (Authentication Disabled)](#local-development-authentication-disabled)
- [Testing with Real AWS Cognito](#testing-with-real-aws-cognito)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)

---

## Local Development (Authentication Disabled)

**Default Mode:** Authentication is bypassed for faster development.

### Configuration

In your `.env` file:
```bash
DISABLE_AUTH="true"
```

### How It Works

When `DISABLE_AUTH="true"`, the authentication middleware automatically injects a test user:

```typescript
{
  id: 1,
  cognitoSub: "dev-bypass-user",
  email: "dev@example.com",
  name: "Development User"
}
```

### Advantages

- ✅ No need to manage JWT tokens during development
- ✅ Faster iteration on business logic
- ✅ No AWS Cognito setup required
- ✅ No authentication headaches during local development

### Limitations

- ❌ Cannot test authentication flows
- ❌ Cannot test authorization logic
- ❌ Cannot test token expiration
- ❌ All requests appear to come from the same user

---

## Testing with Real AWS Cognito

When you need to test authentication logic, you can connect to a real AWS Cognito User Pool.

### Step 1: Create a Test Cognito User Pool

**Option A: AWS Console**
1. Go to AWS Cognito Console
2. Create a new User Pool named `pet-shelter-test`
3. Configure:
   - Sign-in options: Email
   - Password policy: Minimum requirements
   - MFA: Optional (disabled for testing)
4. Create an App Client (no client secret)
5. Note the **User Pool ID** and **Client ID**

**Option B: AWS CLI**
```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name pet-shelter-test \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":false,"RequireLowercase":false,"RequireNumbers":false,"RequireSymbols":false}}' \
  --auto-verified-attributes email \
  --username-attributes email

# Create App Client (use User Pool ID from above)
aws cognito-idp create-user-pool-client \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --client-name pet-shelter-test-client \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --generate-secret false
```

### Step 2: Create Test Users

```bash
# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=name,Value="Test User" \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username test@example.com \
  --password TestPassword123! \
  --permanent
```

### Step 3: Configure Your Application

Update your `.env` file:

```bash
# Disable auth bypass
DISABLE_AUTH="false"

# Add Cognito credentials
AWS_REGION="us-east-1"
AWS_COGNITO_USER_POOL_ID="us-east-1_YourPoolID"
AWS_COGNITO_CLIENT_ID="YourClientID"
```

### Step 4: Get an Authentication Token

Create a helper script or use AWS CLI:

```bash
# Authenticate and get ID token
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <YOUR_CLIENT_ID> \
  --auth-parameters USERNAME=test@example.com,PASSWORD=TestPassword123! \
  --query 'AuthenticationResult.IdToken' \
  --output text
```

Save the token for testing.

### Step 5: Test with cURL or Postman

```bash
# Use the token in requests
curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  http://localhost:8080/api/v1/pets
```

### Step 6: Return to Development Mode

When done testing, re-enable auth bypass:

```bash
DISABLE_AUTH="true"
```

---

## Unit Tests

Unit tests automatically mock the authentication middleware (see `src/test-setup.ts:4-16`).

### How It Works

```typescript
vi.mock("@/common/middleware/authenticate", () => ({
  authenticate: vi.fn((req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: 1,
      cognitoSub: "test-cognito-sub-123",
      email: "test@example.com",
      name: "Test User",
    };
    next();
  }),
}));
```

### Running Unit Tests

```bash
pnpm test
```

Unit tests will run with mocked authentication, regardless of `.env` settings.

---

## Integration Tests

For integration tests that verify the full authentication flow:

### Option 1: Test Against Real Cognito

Create a separate test environment with real Cognito:

```typescript
// tests/integration/auth.test.ts
describe("Authentication Integration", () => {
  const testToken = process.env.TEST_COGNITO_TOKEN;

  it("should authenticate with valid token", async () => {
    const response = await request(app)
      .get("/api/v1/pets")
      .set("Authorization", `Bearer ${testToken}`);

    expect(response.status).toBe(200);
  });

  it("should reject invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/pets")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});
```

### Option 2: Mock JWT Verification

Use a library like `jsonwebtoken` to create test tokens:

```typescript
import jwt from "jsonwebtoken";

const createTestToken = () => {
  return jwt.sign(
    {
      sub: "test-user-123",
      email: "test@example.com",
      name: "Test User",
    },
    "test-secret"
  );
};
```

---

## CI/CD Pipeline

### Recommended Approach

Use GitHub Actions (or your CI platform) with real AWS Cognito for testing:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432

      localstack:
        image: localstack/localstack:4.0
        env:
          SERVICES: s3
        ports:
          - 4566:4566

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '23'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test
        env:
          DISABLE_AUTH: "true"
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          AWS_S3_ENDPOINT: http://localhost:4566

      - name: Run integration tests with Cognito
        run: pnpm test:integration
        env:
          DISABLE_AUTH: "false"
          AWS_COGNITO_USER_POOL_ID: ${{ secrets.TEST_COGNITO_POOL_ID }}
          AWS_COGNITO_CLIENT_ID: ${{ secrets.TEST_COGNITO_CLIENT_ID }}
          TEST_COGNITO_TOKEN: ${{ secrets.TEST_COGNITO_TOKEN }}
```

### GitHub Secrets to Add

- `TEST_COGNITO_POOL_ID`: Your test Cognito User Pool ID
- `TEST_COGNITO_CLIENT_ID`: Your test Cognito Client ID
- `TEST_COGNITO_TOKEN`: A valid ID token for testing (refresh periodically)

---

## Production Deployment

### Configuration

In production `.env`:

```bash
NODE_ENV="production"

# CRITICAL: Authentication MUST be enabled in production
DISABLE_AUTH="false"

# Real AWS credentials (prefer IAM roles over hardcoded keys)
AWS_REGION="us-east-1"

# Production Cognito
AWS_COGNITO_USER_POOL_ID="us-east-1_ProductionPoolID"
AWS_COGNITO_CLIENT_ID="ProductionClientID"

# Production RDS
DATABASE_URL="postgresql://user:pass@prod-rds.region.rds.amazonaws.com:5432/prod_db"

# Production S3 (no endpoint = real AWS S3)
AWS_S3_BUCKET_NAME="prod-pet-photos"
# AWS_S3_ENDPOINT is not set for production
```

### Security Checklist

- [ ] `DISABLE_AUTH="false"` is set
- [ ] Real AWS Cognito credentials are configured
- [ ] IAM roles are used instead of access keys (if deployed on AWS)
- [ ] Environment variables are stored securely (AWS Secrets Manager, etc.)
- [ ] Cognito User Pool has appropriate security settings:
  - [ ] MFA enabled (recommended)
  - [ ] Strong password policy
  - [ ] Account recovery configured
  - [ ] Advanced security features enabled

---

## Summary: Testing Strategy by Environment

| Environment | Auth Mode | Test Type | Purpose |
|-------------|-----------|-----------|---------|
| **Local Development** | `DISABLE_AUTH=true` | Manual testing | Fast iteration on features |
| **Local Auth Testing** | `DISABLE_AUTH=false` + Test Cognito | Manual testing | Verify auth flows work |
| **Unit Tests** | Mocked | Automated | Test business logic |
| **Integration Tests** | Real Cognito or mocked JWTs | Automated | Test API contracts |
| **Staging** | Real Cognito | Manual + Automated | Pre-production validation |
| **Production** | Real Cognito | Monitoring | Live system |

---

## Quick Reference

### Enable/Disable Authentication

```bash
# Disable authentication (local development)
DISABLE_AUTH="true"

# Enable authentication (testing/production)
DISABLE_AUTH="false"
```

### Get a Test Token

```bash
# Using AWS CLI
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=YourPassword123! \
  --query 'AuthenticationResult.IdToken' \
  --output text
```

### Test an Authenticated Endpoint

```bash
# With authentication disabled (development)
curl http://localhost:8080/api/v1/pets

# With authentication enabled (use token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/pets
```

---

## Troubleshooting

### "Authentication not configured" Error

**Cause:** `DISABLE_AUTH=false` but Cognito credentials are missing.

**Solution:** Either set `DISABLE_AUTH=true` or provide valid Cognito credentials.

### "Invalid or expired token" Error

**Cause:** Token has expired or is invalid.

**Solution:** Generate a new token using the AWS CLI command above.

### Tests Fail with Authentication Error

**Cause:** Tests are not using mocked authentication.

**Solution:** Ensure `src/test-setup.ts` is properly configured and imported.

---

## Best Practices

1. **Local Development**: Keep `DISABLE_AUTH=true` for day-to-day work
2. **Before PR**: Test critical auth flows with real Cognito (`DISABLE_AUTH=false`)
3. **CI/CD**: Run tests with mocked auth for speed, real Cognito for integration
4. **Staging**: Always test with real Cognito before deploying to production
5. **Production**: `DISABLE_AUTH=false` is mandatory

---

For questions or issues, please refer to the main [README.md](./README.md) or open an issue.
