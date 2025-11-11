import type { Vaccine } from "@/api/vaccine/vaccineModel";
import { db } from "@/database";

interface VaccineFilters {
	speciesId?: number;
}

interface CreateVaccineData {
	name: string;
	speciesId: number;
}

export class VaccineRepository {
	async findAllAsync(filters: VaccineFilters = {}): Promise<Vaccine[]> {
		let query = db.selectFrom("vaccines").selectAll();

		// Apply filters
		if (filters.speciesId) {
			query = query.where("species_id", "=", filters.speciesId);
		}

		const vaccines = await query.execute();

		return vaccines.map((vaccine) => ({
			id: vaccine.id,
			name: vaccine.name,
			speciesId: vaccine.species_id,
			createdAt: vaccine.created_at,
		}));
	}

	async findByIdAsync(id: number): Promise<Vaccine | null> {
		const vaccine = await db.selectFrom("vaccines").selectAll().where("id", "=", id).executeTakeFirst();

		if (!vaccine) return null;

		return {
			id: vaccine.id,
			name: vaccine.name,
			speciesId: vaccine.species_id,
			createdAt: vaccine.created_at,
		};
	}

	async createAsync(data: CreateVaccineData): Promise<Vaccine> {
		const newVaccine = await db
			.insertInto("vaccines")
			.values({
				name: data.name,
				species_id: data.speciesId,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newVaccine.id,
			name: newVaccine.name,
			speciesId: newVaccine.species_id,
			createdAt: newVaccine.created_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		const result = await db.deleteFrom("vaccines").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}
}
