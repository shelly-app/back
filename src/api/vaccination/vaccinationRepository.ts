import type { Vaccination } from "@/api/vaccination/vaccinationModel";
import { db } from "@/database";

interface VaccinationFilters {
	petId?: number;
	vaccineId?: number;
	includeDeleted?: boolean;
}

interface CreateVaccinationData {
	vaccineId: number;
	petId: number;
}

export class VaccinationRepository {
	async findAllAsync(filters: VaccinationFilters = {}): Promise<Vaccination[]> {
		let query = db.selectFrom("vaccinations").selectAll();

		// Apply filters
		if (filters.petId) {
			query = query.where("pet_id", "=", filters.petId);
		}
		if (filters.vaccineId) {
			query = query.where("vaccine_id", "=", filters.vaccineId);
		}

		// Filter soft deleted unless explicitly included
		if (!filters.includeDeleted) {
			query = query.where("deleted_at", "is", null);
		}

		const vaccinations = await query.execute();

		return vaccinations.map((vaccination) => ({
			id: vaccination.id,
			vaccineId: vaccination.vaccine_id,
			petId: vaccination.pet_id,
			createdAt: vaccination.created_at,
			deletedAt: vaccination.deleted_at,
		}));
	}

	async findByIdAsync(id: number): Promise<Vaccination | null> {
		const vaccination = await db
			.selectFrom("vaccinations")
			.selectAll()
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!vaccination) return null;

		return {
			id: vaccination.id,
			vaccineId: vaccination.vaccine_id,
			petId: vaccination.pet_id,
			createdAt: vaccination.created_at,
			deletedAt: vaccination.deleted_at,
		};
	}

	async createAsync(data: CreateVaccinationData): Promise<Vaccination> {
		const newVaccination = await db
			.insertInto("vaccinations")
			.values({
				vaccine_id: data.vaccineId,
				pet_id: data.petId,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newVaccination.id,
			vaccineId: newVaccination.vaccine_id,
			petId: newVaccination.pet_id,
			createdAt: newVaccination.created_at,
			deletedAt: newVaccination.deleted_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Soft delete
		const result = await db
			.updateTable("vaccinations")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		return Number(result.numUpdatedRows) > 0;
	}
}
