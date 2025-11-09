import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "@/common/utils/envConfig";
import type { Database } from "./database.types";

// Create a PostgreSQL connection pool
const pool = new Pool({
	connectionString: env.DATABASE_URL,
	max: 10, // Maximum number of clients in the pool
});

// Create Kysely instance
export const db = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool,
	}),
});

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
	try {
		await db.selectFrom("users").select("id").limit(1).execute();
		return true;
	} catch (error) {
		console.error("Database connection failed:", error);
		return false;
	}
}

// Helper function to close database connection (useful for tests)
export async function closeDatabaseConnection(): Promise<void> {
	await db.destroy();
}
