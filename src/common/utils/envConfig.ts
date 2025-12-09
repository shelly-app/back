import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

	HOST: z.string().min(1).default("localhost"),

	PORT: z.coerce.number().int().positive().default(8080),

	CORS_ORIGIN: z.string().url().default("http://localhost:8080"),

	COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

	COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

	DATABASE_URL: z.string().url(),

	// AWS Cognito Configuration (optional during development, required in production)
	AWS_REGION: z.string().min(1).default("us-east-1"),
	AWS_COGNITO_USER_POOL_ID: z.string().min(1).optional(),
	AWS_COGNITO_CLIENT_ID: z.string().min(1).optional(),

	// AWS SES Configuration (optional for email invitations)
	AWS_SES_FROM_EMAIL: z.string().email().optional(),

	// AWS S3 Configuration
	AWS_S3_BUCKET_NAME: z.string().min(1).default("pet-photos"),
	AWS_S3_ENDPOINT: z.string().url().optional(), // For LocalStack, omit for real AWS
	AWS_ACCESS_KEY_ID: z.string().min(1).default("test"), // Default for LocalStack
	AWS_SECRET_ACCESS_KEY: z.string().min(1).default("test"), // Default for LocalStack
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = {
	...parsedEnv.data,
	isDevelopment: parsedEnv.data.NODE_ENV === "development",
	isProduction: parsedEnv.data.NODE_ENV === "production",
	isTest: parsedEnv.data.NODE_ENV === "test",
};
