import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	// PetSpecies lookup table
	await db.schema
		.createTable("pet_species")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("species", "varchar(50)", (col) => col.notNull().unique())
		.execute();

	// Sex lookup table
	await db.schema
		.createTable("sexes")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("sex", "varchar(20)", (col) => col.notNull().unique())
		.execute();

	// PetStatus lookup table
	await db.schema
		.createTable("pet_statuses")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("status", "varchar(50)", (col) => col.notNull().unique())
		.execute();

	// PetSize lookup table
	await db.schema
		.createTable("pet_sizes")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("size", "varchar(20)", (col) => col.notNull().unique())
		.execute();

	// PetColor lookup table
	await db.schema
		.createTable("pet_colors")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("color", "varchar(50)", (col) => col.notNull().unique())
		.execute();

	// AdoptionStatus lookup table
	await db.schema
		.createTable("adoption_statuses")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("status", "varchar(50)", (col) => col.notNull().unique())
		.execute();

	// Insert default values for pet_species
	await sql`INSERT INTO pet_species (species) VALUES ('dog'), ('cat')`.execute(db);

	// Insert default values for sexes
	await sql`INSERT INTO sexes (sex) VALUES ('male'), ('female')`.execute(db);

	// Insert default values for pet_statuses
	await sql`INSERT INTO pet_statuses (status) VALUES ('in_shelter'), ('in_transit'), ('adopted')`.execute(db);

	// Insert default values for pet_sizes
	await sql`INSERT INTO pet_sizes (size) VALUES ('small'), ('medium'), ('large')`.execute(db);

	// Insert default values for pet_colors
	await sql`
		INSERT INTO pet_colors (color) VALUES
		('black'), ('white'), ('brown'), ('gray'), ('beige'), ('golden'),
		('coffee'), ('cream'), ('chocolate'), ('orange'), ('cinnamon'), ('fawn')
	`.execute(db);

	// Insert default values for adoption_statuses
	await sql`INSERT INTO adoption_statuses (status) VALUES ('pending'), ('approved'), ('rejected')`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("adoption_statuses").ifExists().execute();
	await db.schema.dropTable("pet_colors").ifExists().execute();
	await db.schema.dropTable("pet_sizes").ifExists().execute();
	await db.schema.dropTable("pet_statuses").ifExists().execute();
	await db.schema.dropTable("sexes").ifExists().execute();
	await db.schema.dropTable("pet_species").ifExists().execute();
}
