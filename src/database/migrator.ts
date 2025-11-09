import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "./database";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToLatest() {
	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, "migrations"),
		}),
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(`✅ Migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === "Error") {
			console.error(`❌ Failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("❌ Failed to migrate:");
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

async function migrateDown() {
	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, "migrations"),
		}),
	});

	const { error, results } = await migrator.migrateDown();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(`✅ Migration "${it.migrationName}" was rolled back successfully`);
		} else if (it.status === "Error") {
			console.error(`❌ Failed to rollback migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("❌ Failed to rollback:");
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

// Run migrations based on command
const command = process.argv[2];

if (command === "up") {
	migrateToLatest();
} else if (command === "down") {
	migrateDown();
} else {
	console.log("Usage: tsx migrator.ts [up|down]");
	process.exit(1);
}
