import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Vaccines table
	await db.schema
		.createTable("vaccines")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "varchar(255)", (col) => col.notNull())
		.addColumn("species_id", "integer", (col) => col.notNull().references("pet_species.id").onDelete("restrict"))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create index on species_id
	await db.schema.createIndex("idx_vaccines_species_id").on("vaccines").column("species_id").execute();

	// Add unique constraint on name + species_id (same vaccine name can exist for different species)
	await db.schema
		.createIndex("idx_vaccines_name_species")
		.on("vaccines")
		.columns(["name", "species_id"])
		.unique()
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("vaccines").ifExists().execute();
}
