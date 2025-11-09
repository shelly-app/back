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
		},
	},
	plugins: [tsconfigPaths()],
});
