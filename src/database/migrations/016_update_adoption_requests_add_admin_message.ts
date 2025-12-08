import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add admin_message column to allow admins to add messages when processing adoption requests
	await db.schema.alterTable("adoption_requests").addColumn("admin_message", "text").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable("adoption_requests").dropColumn("admin_message").execute();
}
