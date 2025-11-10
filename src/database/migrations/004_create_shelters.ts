import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Shelters table with embedded location fields
	await db.schema
		.createTable("shelters")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "varchar(255)", (col) => col.notNull())
		.addColumn("address", "varchar(500)")
		.addColumn("city", "varchar(100)")
		.addColumn("state", "varchar(100)")
		.addColumn("country", "varchar(100)")
		.addColumn("zip", "integer")
		.addColumn("latitude", "decimal(10, 8)")
		.addColumn("longitude", "decimal(11, 8)")
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("deleted_at", "timestamp")
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_shelters_city").on("shelters").column("city").execute();
	await db.schema.createIndex("idx_shelters_state").on("shelters").column("state").execute();
	await db.schema.createIndex("idx_shelters_deleted_at").on("shelters").column("deleted_at").execute();

	// Create trigger for updated_at
	await sql`
		CREATE TRIGGER update_shelters_updated_at
		BEFORE UPDATE ON shelters
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_shelters_updated_at ON shelters`.execute(db);
	await db.schema.dropTable("shelters").ifExists().execute();
}
