import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			exclude: ["**/node_modules/**", "**/index.ts, ", "vite.config.mts"],
		},
		globals: true,
		restoreMocks: true,
		setupFiles: ["./src/test-setup.ts"],
		env: {
			DATABASE_URL: "postgresql://test:test@localhost:5432/test",
			NODE_ENV: "test",
			AWS_REGION: "us-east-1",
			AWS_COGNITO_USER_POOL_ID: "us-east-1_test123456",
			AWS_COGNITO_CLIENT_ID: "test-client-id-123456789",
			AWS_SES_FROM_EMAIL: "test@example.com",
			AWS_S3_BUCKET_NAME: "pet-photos",
			AWS_S3_ENDPOINT: "http://localhost:4566",
			AWS_ACCESS_KEY_ID: "test",
			AWS_SECRET_ACCESS_KEY: "test",
		},
	},
	plugins: [tsconfigPaths()],
});
