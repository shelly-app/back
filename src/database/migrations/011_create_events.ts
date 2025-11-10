import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Events table
	await db.schema
		.createTable("events")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("pet_id", "integer", (col) => col.notNull().references("pets.id").onDelete("cascade"))
		.addColumn("name", "varchar(255)", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("date_time", "timestamp", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("deleted_at", "timestamp")
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_events_pet_id").on("events").column("pet_id").execute();
	await db.schema.createIndex("idx_events_date_time").on("events").column("date_time").execute();
	await db.schema.createIndex("idx_events_deleted_at").on("events").column("deleted_at").execute();

	// Create trigger for updated_at
	await sql`
		CREATE TRIGGER update_events_updated_at
		BEFORE UPDATE ON events
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_events_updated_at ON events`.execute(db);
	await db.schema.dropTable("events").ifExists().execute();
}
