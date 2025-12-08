import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Add deleted_at column for soft delete functionality
	await db.schema.alterTable("pets").addColumn("deleted_at", "timestamp").execute();

	// Create index on deleted_at for filtering non-deleted pets
	await db.schema.createIndex("idx_pets_deleted_at").on("pets").column("deleted_at").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropIndex("idx_pets_deleted_at").execute();
	await db.schema.alterTable("pets").dropColumn("deleted_at").execute();
}
