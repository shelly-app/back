import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Assignments table (user-role-shelter mapping)
	// This fixes the diagram issue by adding shelter_id to scope permissions per shelter
	await db.schema
		.createTable("assignments")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) => col.notNull().references("users.id").onDelete("cascade"))
		.addColumn("role_id", "integer", (col) => col.notNull().references("roles.id").onDelete("restrict"))
		.addColumn("shelter_id", "integer", (col) => col.notNull().references("shelters.id").onDelete("cascade"))
		.execute();

	// Create indexes
	await db.schema.createIndex("idx_assignments_user_id").on("assignments").column("user_id").execute();
	await db.schema.createIndex("idx_assignments_role_id").on("assignments").column("role_id").execute();
	await db.schema.createIndex("idx_assignments_shelter_id").on("assignments").column("shelter_id").execute();

	// Unique constraint: one role per user per shelter
	await db.schema
		.createIndex("idx_assignments_unique")
		.on("assignments")
		.columns(["user_id", "role_id", "shelter_id"])
		.unique()
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("assignments").ifExists().execute();
}
