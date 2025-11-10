import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Adoption requests table
	await db.schema
		.createTable("adoption_requests")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("pet_id", "integer", (col) => col.notNull().references("pets.id").onDelete("cascade"))
		.addColumn("user_id", "integer", (col) => col.notNull().references("users.id").onDelete("cascade"))
		.addColumn("status_id", "integer", (col) => col.notNull().references("adoption_statuses.id").onDelete("restrict"))
		.addColumn("answers", "jsonb", (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_adoption_requests_pet_id").on("adoption_requests").column("pet_id").execute();
	await db.schema.createIndex("idx_adoption_requests_user_id").on("adoption_requests").column("user_id").execute();
	await db.schema.createIndex("idx_adoption_requests_status_id").on("adoption_requests").column("status_id").execute();

	// Create trigger for updated_at
	await sql`
		CREATE TRIGGER update_adoption_requests_updated_at
		BEFORE UPDATE ON adoption_requests
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_adoption_requests_updated_at ON adoption_requests`.execute(db);
	await db.schema.dropTable("adoption_requests").ifExists().execute();
}
