import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable("pet_photos")
		.addColumn("content_type", "varchar(100)")
		.addColumn("size", "integer")
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable("pet_photos").dropColumn("content_type").dropColumn("size").execute();
}
