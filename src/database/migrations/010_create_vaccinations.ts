import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Vaccinations table (junction table with additional fields)
	await db.schema
		.createTable("vaccinations")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("vaccine_id", "integer", (col) => col.notNull().references("vaccines.id").onDelete("restrict"))
		.addColumn("pet_id", "integer", (col) => col.notNull().references("pets.id").onDelete("cascade"))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("deleted_at", "timestamp")
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_vaccinations_vaccine_id").on("vaccinations").column("vaccine_id").execute();
	await db.schema.createIndex("idx_vaccinations_pet_id").on("vaccinations").column("pet_id").execute();
	await db.schema.createIndex("idx_vaccinations_deleted_at").on("vaccinations").column("deleted_at").execute();

	// Create unique constraint to prevent duplicate vaccinations (partial index for non-deleted records)
	await sql`
		CREATE UNIQUE INDEX idx_vaccinations_unique
		ON vaccinations (pet_id, vaccine_id)
		WHERE deleted_at IS NULL
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("vaccinations").ifExists().execute();
}
