import type { Pet, PetDetail } from "@/api/pet/petModel";
import { db } from "@/database";

interface PetFilters {
	speciesId?: number;
	statusId?: number;
	shelterId?: number;
	sizeId?: number;
	colorId?: number;
}

interface CreatePetData {
	name: string;
	birthdate?: string | null;
	breed?: string | null;
	speciesId: number;
	sexId: number;
	statusId: number;
	sizeId: number;
	description?: string | null;
	shelterId: number;
	colorIds: number[];
}

interface UpdatePetData {
	name?: string;
	birthdate?: string | null;
	breed?: string | null;
	speciesId?: number;
	sexId?: number;
	statusId?: number;
	sizeId?: number;
	description?: string | null;
	shelterId?: number;
	colorIds?: number[];
}

export class PetRepository {
	async findAllAsync(filters: PetFilters = {}, includeDeleted = false): Promise<Pet[]> {
		let query = db
			.selectFrom("pets")
			.innerJoin("pet_species", "pets.species_id", "pet_species.id")
			.innerJoin("sexes", "pets.sex_id", "sexes.id")
			.innerJoin("pet_statuses", "pets.status_id", "pet_statuses.id")
			.innerJoin("pet_sizes", "pets.size_id", "pet_sizes.id")
			.select([
				"pets.id",
				"pets.name",
				"pets.birthdate",
				"pets.breed",
				"pets.description",
				"pets.shelter_id",
				"pets.created_at",
				"pets.updated_at",
				"pet_species.id as speciesId",
				"pet_species.species as speciesName",
				"sexes.id as sexId",
				"sexes.sex as sexName",
				"pet_statuses.id as statusId",
				"pet_statuses.status as statusName",
				"pet_sizes.id as sizeId",
				"pet_sizes.size as sizeName",
			]);

		// Filter out deleted pets by default
		if (!includeDeleted) {
			query = query.where("pets.deleted_at", "is", null);
		}

		// Apply filters
		if (filters.speciesId) {
			query = query.where("pets.species_id", "=", filters.speciesId);
		}
		if (filters.statusId) {
			query = query.where("pets.status_id", "=", filters.statusId);
		}
		if (filters.shelterId) {
			query = query.where("pets.shelter_id", "=", filters.shelterId);
		}
		if (filters.sizeId) {
			query = query.where("pets.size_id", "=", filters.sizeId);
		}

		// If filtering by color, join with pet_pet_colors
		if (filters.colorId) {
			query = query
				.innerJoin("pet_pet_colors", "pets.id", "pet_pet_colors.pet_id")
				.where("pet_pet_colors.color_id", "=", filters.colorId);
		}

		const pets = await query.execute();

		// For each pet, fetch its colors
		const petsWithColors = await Promise.all(
			pets.map(async (pet) => {
				const colors = await db
					.selectFrom("pet_pet_colors")
					.innerJoin("pet_colors", "pet_pet_colors.color_id", "pet_colors.id")
					.select(["pet_colors.id", "pet_colors.color"])
					.where("pet_pet_colors.pet_id", "=", pet.id)
					.execute();

				return {
					id: pet.id,
					name: pet.name,
					birthdate: pet.birthdate,
					breed: pet.breed,
					species: {
						id: pet.speciesId,
						species: pet.speciesName,
					},
					sex: {
						id: pet.sexId,
						sex: pet.sexName,
					},
					status: {
						id: pet.statusId,
						status: pet.statusName,
					},
					size: {
						id: pet.sizeId,
						size: pet.sizeName,
					},
					description: pet.description,
					shelterId: pet.shelter_id,
					colors,
					createdAt: pet.created_at,
					updatedAt: pet.updated_at,
				};
			}),
		);

		return petsWithColors;
	}

	async findByIdAsync(id: number): Promise<Pet | null> {
		const pet = await db
			.selectFrom("pets")
			.innerJoin("pet_species", "pets.species_id", "pet_species.id")
			.innerJoin("sexes", "pets.sex_id", "sexes.id")
			.innerJoin("pet_statuses", "pets.status_id", "pet_statuses.id")
			.innerJoin("pet_sizes", "pets.size_id", "pet_sizes.id")
			.select([
				"pets.id",
				"pets.name",
				"pets.birthdate",
				"pets.breed",
				"pets.description",
				"pets.shelter_id",
				"pets.created_at",
				"pets.updated_at",
				"pet_species.id as speciesId",
				"pet_species.species as speciesName",
				"sexes.id as sexId",
				"sexes.sex as sexName",
				"pet_statuses.id as statusId",
				"pet_statuses.status as statusName",
				"pet_sizes.id as sizeId",
				"pet_sizes.size as sizeName",
			])
			.where("pets.id", "=", id)
			.where("pets.deleted_at", "is", null)
			.executeTakeFirst();

		if (!pet) return null;

		// Fetch colors for this pet
		const colors = await db
			.selectFrom("pet_pet_colors")
			.innerJoin("pet_colors", "pet_pet_colors.color_id", "pet_colors.id")
			.select(["pet_colors.id", "pet_colors.color"])
			.where("pet_pet_colors.pet_id", "=", pet.id)
			.execute();

		return {
			id: pet.id,
			name: pet.name,
			birthdate: pet.birthdate,
			breed: pet.breed,
			species: {
				id: pet.speciesId,
				species: pet.speciesName,
			},
			sex: {
				id: pet.sexId,
				sex: pet.sexName,
			},
			status: {
				id: pet.statusId,
				status: pet.statusName,
			},
			size: {
				id: pet.sizeId,
				size: pet.sizeName,
			},
			description: pet.description,
			shelterId: pet.shelter_id,
			colors,
			createdAt: pet.created_at,
			updatedAt: pet.updated_at,
		};
	}

	async findByIdWithDetailsAsync(id: number): Promise<PetDetail | null> {
		// First get the basic pet information
		const pet = await this.findByIdAsync(id);
		if (!pet) return null;

		// Fetch events for this pet (non-deleted events)
		const eventRows = await db
			.selectFrom("events")
			.selectAll()
			.where("pet_id", "=", id)
			.where("deleted_at", "is", null)
			.execute();

		const events = eventRows.map((event) => ({
			id: event.id,
			petId: event.pet_id,
			name: event.name,
			description: event.description,
			dateTime: event.date_time,
			createdAt: event.created_at,
			updatedAt: event.updated_at,
			deletedAt: event.deleted_at,
		}));

		// Fetch vaccinations with vaccine names (non-deleted vaccinations)
		const vaccinationRows = await db
			.selectFrom("vaccinations")
			.innerJoin("vaccines", "vaccinations.vaccine_id", "vaccines.id")
			.select([
				"vaccinations.id",
				"vaccinations.vaccine_id as vaccineId",
				"vaccinations.pet_id as petId",
				"vaccinations.created_at as createdAt",
				"vaccinations.deleted_at as deletedAt",
				"vaccines.name as vaccineName",
			])
			.where("vaccinations.pet_id", "=", id)
			.where("vaccinations.deleted_at", "is", null)
			.execute();

		const vaccinations = vaccinationRows.map((vac) => ({
			id: vac.id,
			vaccineId: vac.vaccineId,
			petId: vac.petId,
			createdAt: vac.createdAt,
			deletedAt: vac.deletedAt,
			vaccineName: vac.vaccineName,
		}));

		return {
			...pet,
			events,
			vaccinations,
		};
	}

	async createAsync(petData: CreatePetData): Promise<Pet> {
		// Start a transaction to create pet and its colors
		const petId = await db.transaction().execute(async (trx) => {
			// Create the pet
			const newPet = await trx
				.insertInto("pets")
				.values({
					name: petData.name,
					birthdate: petData.birthdate || null,
					breed: petData.breed || null,
					species_id: petData.speciesId,
					sex_id: petData.sexId,
					status_id: petData.statusId,
					size_id: petData.sizeId,
					description: petData.description || null,
					shelter_id: petData.shelterId,
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			// Insert colors
			if (petData.colorIds.length > 0) {
				await trx
					.insertInto("pet_pet_colors")
					.values(petData.colorIds.map((colorId) => ({ pet_id: newPet.id, color_id: colorId })))
					.execute();
			}

			return newPet.id;
		});

		// Fetch and return the complete pet with nested lookup objects
		const pet = await this.findByIdAsync(petId);
		if (!pet) {
			throw new Error("Failed to retrieve created pet");
		}
		return pet;
	}

	async updateAsync(id: number, petData: UpdatePetData): Promise<Pet | null> {
		await db.transaction().execute(async (trx) => {
			// Update pet basic info if provided
			const updateData: {
				name?: string;
				birthdate?: string | null;
				breed?: string | null;
				species_id?: number;
				sex_id?: number;
				status_id?: number;
				size_id?: number;
				description?: string | null;
				shelter_id?: number;
			} = {};
			if (petData.name !== undefined) updateData.name = petData.name;
			if (petData.birthdate !== undefined) updateData.birthdate = petData.birthdate;
			if (petData.breed !== undefined) updateData.breed = petData.breed;
			if (petData.speciesId !== undefined) updateData.species_id = petData.speciesId;
			if (petData.sexId !== undefined) updateData.sex_id = petData.sexId;
			if (petData.statusId !== undefined) updateData.status_id = petData.statusId;
			if (petData.sizeId !== undefined) updateData.size_id = petData.sizeId;
			if (petData.description !== undefined) updateData.description = petData.description;
			if (petData.shelterId !== undefined) updateData.shelter_id = petData.shelterId;

			let updatedPet = null;
			if (Object.keys(updateData).length > 0) {
				updatedPet = await trx
					.updateTable("pets")
					.set(updateData)
					.where("id", "=", id)
					.returningAll()
					.executeTakeFirst();

				if (!updatedPet) return null;
			} else {
				updatedPet = await trx.selectFrom("pets").selectAll().where("id", "=", id).executeTakeFirst();
				if (!updatedPet) return null;
			}

			// Update colors if provided
			if (petData.colorIds !== undefined) {
				// Remove existing colors
				await trx.deleteFrom("pet_pet_colors").where("pet_id", "=", id).execute();

				// Add new colors
				if (petData.colorIds.length > 0) {
					await trx
						.insertInto("pet_pet_colors")
						.values(petData.colorIds.map((colorId) => ({ pet_id: id, color_id: colorId })))
						.execute();
				}
			}
		});

		// Fetch and return the complete pet with nested lookup objects
		return await this.findByIdAsync(id);
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Delete pet (cascade will handle pet_pet_colors)
		const result = await db.deleteFrom("pets").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}

	async archiveAsync(id: number): Promise<Pet | null> {
		const result = await db
			.updateTable("pets")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.returningAll()
			.executeTakeFirst();

		if (!result) return null;

		// Fetch the complete pet with nested lookup objects (including the archived one)
		const pet = await db
			.selectFrom("pets")
			.innerJoin("pet_species", "pets.species_id", "pet_species.id")
			.innerJoin("sexes", "pets.sex_id", "sexes.id")
			.innerJoin("pet_statuses", "pets.status_id", "pet_statuses.id")
			.innerJoin("pet_sizes", "pets.size_id", "pet_sizes.id")
			.select([
				"pets.id",
				"pets.name",
				"pets.birthdate",
				"pets.breed",
				"pets.description",
				"pets.shelter_id",
				"pets.created_at",
				"pets.updated_at",
				"pet_species.id as speciesId",
				"pet_species.species as speciesName",
				"sexes.id as sexId",
				"sexes.sex as sexName",
				"pet_statuses.id as statusId",
				"pet_statuses.status as statusName",
				"pet_sizes.id as sizeId",
				"pet_sizes.size as sizeName",
			])
			.where("pets.id", "=", id)
			.executeTakeFirst();

		if (!pet) return null;

		// Fetch colors for the archived pet
		const colors = await db
			.selectFrom("pet_pet_colors")
			.innerJoin("pet_colors", "pet_pet_colors.color_id", "pet_colors.id")
			.select(["pet_colors.id", "pet_colors.color"])
			.where("pet_pet_colors.pet_id", "=", id)
			.execute();

		return {
			id: pet.id,
			name: pet.name,
			birthdate: pet.birthdate,
			breed: pet.breed,
			species: {
				id: pet.speciesId,
				species: pet.speciesName,
			},
			sex: {
				id: pet.sexId,
				sex: pet.sexName,
			},
			status: {
				id: pet.statusId,
				status: pet.statusName,
			},
			size: {
				id: pet.sizeId,
				size: pet.sizeName,
			},
			description: pet.description,
			shelterId: pet.shelter_id,
			colors,
			createdAt: pet.created_at,
			updatedAt: pet.updated_at,
		};
	}
}
