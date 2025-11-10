import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Pet photos table
	await db.schema
		.createTable("pet_photos")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("pet_id", "integer", (col) => col.notNull().references("pets.id").onDelete("cascade"))
		.addColumn("key", "varchar(500)", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("deleted_at", "timestamp")
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_pet_photos_pet_id").on("pet_photos").column("pet_id").execute();
	await db.schema.createIndex("idx_pet_photos_deleted_at").on("pet_photos").column("deleted_at").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("pet_photos").ifExists().execute();
}
