import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Roles table
	await db.schema
		.createTable("roles")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("role", "varchar(50)", (col) => col.notNull().unique())
		.execute();

	// Insert default roles
	await sql`INSERT INTO roles (role) VALUES ('admin'), ('member'), ('adopter')`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("roles").ifExists().execute();
}
