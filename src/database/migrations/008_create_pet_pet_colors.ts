import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// Junction table for pets and colors (many-to-many)
	// This fixes the array issue from the diagram and allows efficient querying
	await db.schema
		.createTable("pet_pet_colors")
		.addColumn("pet_id", "integer", (col) => col.notNull().references("pets.id").onDelete("cascade"))
		.addColumn("color_id", "integer", (col) => col.notNull().references("pet_colors.id").onDelete("restrict"))
		.addPrimaryKeyConstraint("pet_pet_colors_pk", ["pet_id", "color_id"])
		.execute();

	// Create indexes for efficient lookups in both directions
	await db.schema.createIndex("idx_pet_pet_colors_pet_id").on("pet_pet_colors").column("pet_id").execute();
	await db.schema.createIndex("idx_pet_pet_colors_color_id").on("pet_pet_colors").column("color_id").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("pet_pet_colors").ifExists().execute();
}
