import { StatusCodes } from "http-status-codes";

import type { Shelter } from "@/api/shelter/shelterModel";
import { ShelterRepository } from "@/api/shelter/shelterRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface ShelterFilters {
	city?: string;
	state?: string;
	country?: string;
	includeDeleted?: boolean;
}

interface CreateShelterData {
	name: string;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	zip?: number | null;
	latitude?: number | null;
	longitude?: number | null;
}

interface UpdateShelterData {
	name?: string;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	zip?: number | null;
	latitude?: number | null;
	longitude?: number | null;
}

export class ShelterService {
	private shelterRepository: ShelterRepository;

	constructor(repository: ShelterRepository = new ShelterRepository()) {
		this.shelterRepository = repository;
	}

	// Retrieves all shelters from the database with optional filters
	async findAll(filters: ShelterFilters = {}): Promise<ServiceResponse<Shelter[] | null>> {
		try {
			const shelters = await this.shelterRepository.findAllAsync(filters);
			if (!shelters || shelters.length === 0) {
				return ServiceResponse.failure("No Shelters found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter[]>("Shelters found", shelters);
		} catch (ex) {
			const errorMessage = `Error finding all shelters: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving shelters.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single shelter by their ID
	async findById(id: number): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.findByIdAsync(id);
			if (!shelter) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter>("Shelter found", shelter);
		} catch (ex) {
			const errorMessage = `Error finding shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Creates a new shelter
	async create(shelterData: CreateShelterData): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.createAsync(shelterData);
			return ServiceResponse.success<Shelter>("Shelter created successfully", shelter, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating shelter: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Updates a shelter by their ID
	async update(id: number, shelterData: UpdateShelterData): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.updateAsync(id, shelterData);
			if (!shelter) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter>("Shelter updated successfully", shelter);
		} catch (ex) {
			const errorMessage = `Error updating shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Deletes a shelter by their ID (soft delete)
	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.shelterRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Shelter deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const shelterService = new ShelterService();
