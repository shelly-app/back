import { StatusCodes } from "http-status-codes";

import type { PetPhoto } from "@/api/petPhoto/petPhotoModel";
import { PetPhotoRepository } from "@/api/petPhoto/petPhotoRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface PetPhotoFilters {
	petId?: number;
	includeDeleted?: boolean;
}

interface CreatePetPhotoData {
	petId: number;
	key: string;
}

export class PetPhotoService {
	private petPhotoRepository: PetPhotoRepository;

	constructor(repository: PetPhotoRepository = new PetPhotoRepository()) {
		this.petPhotoRepository = repository;
	}

	async findAll(filters: PetPhotoFilters = {}): Promise<ServiceResponse<PetPhoto[] | null>> {
		try {
			const petPhotos = await this.petPhotoRepository.findAllAsync(filters);
			if (!petPhotos || petPhotos.length === 0) {
				return ServiceResponse.failure("No Pet Photos found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<PetPhoto[]>("Pet Photos found", petPhotos);
		} catch (ex) {
			const errorMessage = `Error finding all pet photos: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving pet photos.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: number): Promise<ServiceResponse<PetPhoto | null>> {
		try {
			const petPhoto = await this.petPhotoRepository.findByIdAsync(id);
			if (!petPhoto) {
				return ServiceResponse.failure("Pet Photo not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<PetPhoto>("Pet Photo found", petPhoto);
		} catch (ex) {
			const errorMessage = `Error finding pet photo with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding pet photo.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreatePetPhotoData): Promise<ServiceResponse<PetPhoto | null>> {
		try {
			const petPhoto = await this.petPhotoRepository.createAsync(data);
			return ServiceResponse.success<PetPhoto>("Pet Photo created successfully", petPhoto, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating pet photo: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating pet photo.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.petPhotoRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Pet Photo not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Pet Photo deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting pet photo with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting pet photo.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const petPhotoService = new PetPhotoService();
