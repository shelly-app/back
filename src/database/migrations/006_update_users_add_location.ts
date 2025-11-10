import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add location fields to users table
	await db.schema
		.alterTable("users")
		.addColumn("country", "varchar(100)")
		.addColumn("state", "varchar(100)")
		.addColumn("city", "varchar(100)")
		.execute();

	// Create indexes for location fields
	await db.schema.createIndex("idx_users_city").on("users").column("city").execute();
	await db.schema.createIndex("idx_users_state").on("users").column("state").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable("users").dropColumn("country").execute();
	await db.schema.alterTable("users").dropColumn("state").execute();
	await db.schema.alterTable("users").dropColumn("city").execute();
}
