import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add Cognito authentication field to users table
	await db.schema.alterTable("users").addColumn("cognito_sub", "varchar(255)").execute();

	// Create unique index on cognito_sub for fast lookups
	await db.schema.createIndex("idx_users_cognito_sub").on("users").column("cognito_sub").unique().execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropIndex("idx_users_cognito_sub").execute();
	await db.schema.alterTable("users").dropColumn("cognito_sub").execute();
}
