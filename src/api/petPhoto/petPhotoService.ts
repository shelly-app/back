import { StatusCodes } from "http-status-codes";

import type { PetPhoto } from "@/api/petPhoto/petPhotoModel";
import { PetPhotoRepository } from "@/api/petPhoto/petPhotoRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { s3Service } from "@/common/services/s3Service";
import { logger } from "@/server";

interface PetPhotoFilters {
	petId?: number;
	includeDeleted?: boolean;
}

interface CreatePetPhotoData {
	petId: number;
	file: Buffer;
	originalName: string;
	contentType: string;
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
			// Upload file to S3
			const key = await s3Service.uploadPhoto(data.file, data.petId, data.originalName, data.contentType);

			// Save metadata to database
			const petPhoto = await this.petPhotoRepository.createAsync({
				petId: data.petId,
				key,
				contentType: data.contentType,
				size: data.file.length,
			});

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

	async getPhotoUrl(id: number): Promise<ServiceResponse<string | null>> {
		try {
			// Get photo metadata from database
			const petPhoto = await this.petPhotoRepository.findByIdAsync(id);
			if (!petPhoto) {
				return ServiceResponse.failure("Pet Photo not found", null, StatusCodes.NOT_FOUND);
			}

			// Generate signed URL from S3
			const url = await s3Service.getPhotoUrl(petPhoto.key);

			return ServiceResponse.success<string>("Signed URL generated successfully", url);
		} catch (ex) {
			const errorMessage = `Error generating photo URL for id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while generating photo URL.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			// Get photo metadata to retrieve S3 key
			const petPhoto = await this.petPhotoRepository.findByIdAsync(id);
			if (!petPhoto) {
				return ServiceResponse.failure("Pet Photo not found", null, StatusCodes.NOT_FOUND);
			}

			// Soft delete in database
			const deleted = await this.petPhotoRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Pet Photo not found", null, StatusCodes.NOT_FOUND);
			}

			// Delete from S3
			await s3Service.deletePhoto(petPhoto.key);

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
