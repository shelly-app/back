import { StatusCodes } from "http-status-codes";

import type { Pet } from "@/api/pet/petModel";
import { PetRepository } from "@/api/pet/petRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

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

export class PetService {
	private petRepository: PetRepository;

	constructor(repository: PetRepository = new PetRepository()) {
		this.petRepository = repository;
	}

	// Retrieves all pets from the database with optional filters
	async findAll(filters: PetFilters = {}): Promise<ServiceResponse<Pet[] | null>> {
		try {
			const pets = await this.petRepository.findAllAsync(filters);
			if (!pets || pets.length === 0) {
				return ServiceResponse.failure("No Pets found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Pet[]>("Pets found", pets);
		} catch (ex) {
			const errorMessage = `Error finding all pets: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving pets.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single pet by their ID
	async findById(id: number): Promise<ServiceResponse<Pet | null>> {
		try {
			const pet = await this.petRepository.findByIdAsync(id);
			if (!pet) {
				return ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Pet>("Pet found", pet);
		} catch (ex) {
			const errorMessage = `Error finding pet with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Creates a new pet
	async create(petData: CreatePetData): Promise<ServiceResponse<Pet | null>> {
		try {
			const pet = await this.petRepository.createAsync(petData);
			return ServiceResponse.success<Pet>("Pet created successfully", pet, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating pet: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while creating pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Updates a pet by their ID
	async update(id: number, petData: UpdatePetData): Promise<ServiceResponse<Pet | null>> {
		try {
			const pet = await this.petRepository.updateAsync(id, petData);
			if (!pet) {
				return ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Pet>("Pet updated successfully", pet);
		} catch (ex) {
			const errorMessage = `Error updating pet with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while updating pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Deletes a pet by their ID
	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.petRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Pet deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting pet with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while deleting pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Archives a pet by their ID (soft delete)
	async archive(id: number): Promise<ServiceResponse<Pet | null>> {
		try {
			const pet = await this.petRepository.archiveAsync(id);
			if (!pet) {
				return ServiceResponse.failure("Pet not found or already archived", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Pet>("Pet archived successfully", pet);
		} catch (ex) {
			const errorMessage = `Error archiving pet with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while archiving pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const petService = new PetService();
