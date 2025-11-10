import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Pets table
	await db.schema
		.createTable("pets")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "varchar(255)", (col) => col.notNull())
		.addColumn("birthdate", "date")
		.addColumn("breed", "varchar(100)")
		.addColumn("species_id", "integer", (col) => col.notNull().references("pet_species.id").onDelete("restrict"))
		.addColumn("sex_id", "integer", (col) => col.notNull().references("sexes.id").onDelete("restrict"))
		.addColumn("status_id", "integer", (col) => col.notNull().references("pet_statuses.id").onDelete("restrict"))
		.addColumn("size_id", "integer", (col) => col.notNull().references("pet_sizes.id").onDelete("restrict"))
		.addColumn("description", "text")
		.addColumn("shelter_id", "integer", (col) => col.notNull().references("shelters.id").onDelete("restrict"))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create indexes on foreign keys
	await db.schema.createIndex("idx_pets_species_id").on("pets").column("species_id").execute();
	await db.schema.createIndex("idx_pets_sex_id").on("pets").column("sex_id").execute();
	await db.schema.createIndex("idx_pets_status_id").on("pets").column("status_id").execute();
	await db.schema.createIndex("idx_pets_size_id").on("pets").column("size_id").execute();
	await db.schema.createIndex("idx_pets_shelter_id").on("pets").column("shelter_id").execute();

	// Create composite index for common queries
	await db.schema.createIndex("idx_pets_species_status").on("pets").columns(["species_id", "status_id"]).execute();

	// Create trigger for updated_at
	await sql`
		CREATE TRIGGER update_pets_updated_at
		BEFORE UPDATE ON pets
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_pets_updated_at ON pets`.execute(db);
	await db.schema.dropTable("pets").ifExists().execute();
}
