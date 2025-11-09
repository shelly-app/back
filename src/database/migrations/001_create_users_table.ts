import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("users")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "varchar(255)", (col) => col.notNull())
		.addColumn("email", "varchar(255)", (col) => col.notNull().unique())
		.addColumn("age", "integer", (col) => col.notNull().check(sql`age >= 0`))
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create index on email
	await db.schema.createIndex("idx_users_email").on("users").column("email").execute();

	// Create function to update updated_at timestamp
	await sql`
		CREATE OR REPLACE FUNCTION update_updated_at_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = CURRENT_TIMESTAMP;
			RETURN NEW;
		END;
		$$ language 'plpgsql';
	`.execute(db);

	// Create trigger
	await sql`
		CREATE TRIGGER update_users_updated_at
		BEFORE UPDATE ON users
		FOR EACH ROW
		EXECUTE FUNCTION update_updated_at_column();
	`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`.execute(db);
	await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`.execute(db);
	await db.schema.dropTable("users").ifExists().execute();
}
