import type { Pet } from "@/api/pet/petModel";
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
		let query = db.selectFrom("pets").selectAll();

		// Filter out deleted pets by default
		if (!includeDeleted) {
			query = query.where("deleted_at", "is", null);
		}

		// Apply filters
		if (filters.speciesId) {
			query = query.where("species_id", "=", filters.speciesId);
		}
		if (filters.statusId) {
			query = query.where("status_id", "=", filters.statusId);
		}
		if (filters.shelterId) {
			query = query.where("shelter_id", "=", filters.shelterId);
		}
		if (filters.sizeId) {
			query = query.where("size_id", "=", filters.sizeId);
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
					speciesId: pet.species_id,
					sexId: pet.sex_id,
					statusId: pet.status_id,
					sizeId: pet.size_id,
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
			.selectAll()
			.where("id", "=", id)
			.where("deleted_at", "is", null)
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
			speciesId: pet.species_id,
			sexId: pet.sex_id,
			statusId: pet.status_id,
			sizeId: pet.size_id,
			description: pet.description,
			shelterId: pet.shelter_id,
			colors,
			createdAt: pet.created_at,
			updatedAt: pet.updated_at,
		};
	}

	async createAsync(petData: CreatePetData): Promise<Pet> {
		// Start a transaction to create pet and its colors
		const pet = await db.transaction().execute(async (trx) => {
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

			// Fetch colors for response
			const colors = await trx
				.selectFrom("pet_pet_colors")
				.innerJoin("pet_colors", "pet_pet_colors.color_id", "pet_colors.id")
				.select(["pet_colors.id", "pet_colors.color"])
				.where("pet_pet_colors.pet_id", "=", newPet.id)
				.execute();

			return {
				id: newPet.id,
				name: newPet.name,
				birthdate: newPet.birthdate,
				breed: newPet.breed,
				speciesId: newPet.species_id,
				sexId: newPet.sex_id,
				statusId: newPet.status_id,
				sizeId: newPet.size_id,
				description: newPet.description,
				shelterId: newPet.shelter_id,
				colors,
				createdAt: newPet.created_at,
				updatedAt: newPet.updated_at,
			};
		});

		return pet;
	}

	async updateAsync(id: number, petData: UpdatePetData): Promise<Pet | null> {
		const pet = await db.transaction().execute(async (trx) => {
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

			// Fetch colors for response
			const colors = await trx
				.selectFrom("pet_pet_colors")
				.innerJoin("pet_colors", "pet_pet_colors.color_id", "pet_colors.id")
				.select(["pet_colors.id", "pet_colors.color"])
				.where("pet_pet_colors.pet_id", "=", id)
				.execute();

			return {
				id: updatedPet.id,
				name: updatedPet.name,
				birthdate: updatedPet.birthdate,
				breed: updatedPet.breed,
				speciesId: updatedPet.species_id,
				sexId: updatedPet.sex_id,
				statusId: updatedPet.status_id,
				sizeId: updatedPet.size_id,
				description: updatedPet.description,
				shelterId: updatedPet.shelter_id,
				colors,
				createdAt: updatedPet.created_at,
				updatedAt: updatedPet.updated_at,
			};
		});

		return pet;
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Delete pet (cascade will handle pet_pet_colors)
		const result = await db.deleteFrom("pets").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}

	async archiveAsync(id: number): Promise<Pet | null> {
		const pet = await db
			.updateTable("pets")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.returningAll()
			.executeTakeFirst();

		if (!pet) return null;

		// Fetch colors for the archived pet
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
			speciesId: pet.species_id,
			sexId: pet.sex_id,
			statusId: pet.status_id,
			sizeId: pet.size_id,
			description: pet.description,
			shelterId: pet.shelter_id,
			colors,
			createdAt: pet.created_at,
			updatedAt: pet.updated_at,
		};
	}
}
