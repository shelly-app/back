import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shelter_access_requests")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("shelter_name", "varchar(255)", (col) => col.notNull())
		.addColumn("shelter_type", "varchar(100)", (col) => col.notNull())
		.addColumn("country", "varchar(100)", (col) => col.notNull())
		.addColumn("state", "varchar(100)", (col) => col.notNull())
		.addColumn("city", "varchar(100)", (col) => col.notNull())
		.addColumn("contact_name", "varchar(255)", (col) => col.notNull())
		.addColumn("contact_email", "varchar(255)", (col) => col.notNull())
		.addColumn("contact_phone", "varchar(50)", (col) => col.notNull())
		.addColumn("message", "text", (col) => col.notNull())
		.addColumn("status", "varchar(50)", (col) => col.notNull().defaultTo("pending"))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create indexes for commonly queried fields
	await db.schema
		.createIndex("idx_shelter_access_requests_status")
		.on("shelter_access_requests")
		.column("status")
		.execute();
	await db.schema
		.createIndex("idx_shelter_access_requests_created_at")
		.on("shelter_access_requests")
		.column("created_at")
		.execute();

	// Create trigger for updated_at
	await sql`
		CREATE TRIGGER update_shelter_access_requests_updated_at
		BEFORE UPDATE ON shelter_access_requests
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_shelter_access_requests_updated_at ON shelter_access_requests`.execute(db);
	await db.schema.dropTable("shelter_access_requests").ifExists().execute();
}
