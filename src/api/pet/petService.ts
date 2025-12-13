import { StatusCodes } from "http-status-codes";

import type { Pet, PetDetail, PetDetailResponse, PetListItem } from "@/api/pet/petModel";
import { PetRepository } from "@/api/pet/petRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { s3Service } from "@/common/services/s3Service";
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

	// Retrieves a single pet by their ID with full details (events, vaccinations)
	async findById(id: number): Promise<ServiceResponse<PetDetail | null>> {
		try {
			const pet = await this.petRepository.findByIdWithDetailsAsync(id);
			if (!pet) {
				return ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<PetDetail>("Pet found", pet);
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

	// NEW: Retrieves simplified pet list with profile photos (for GET /pets)
	async findAllForList(filters: PetFilters = {}): Promise<ServiceResponse<PetListItem[] | null>> {
		try {
			const pets = await this.petRepository.findAllForListAsync(filters);
			if (!pets || pets.length === 0) {
				return ServiceResponse.failure("No Pets found", null, StatusCodes.NOT_FOUND);
			}

			// Generate signed URLs for profile photos
			const petsWithSignedUrls = await Promise.all(
				pets.map(async (pet) => {
					let profilePhotoUrl: string | null = null;

					if (pet.profilePhotoUrl) {
						try {
							profilePhotoUrl = await s3Service.getPhotoUrl(pet.profilePhotoUrl);
						} catch (error) {
							logger.error(`Failed to generate S3 URL for pet ${pet.id}: ${(error as Error).message}`);
							// Keep as null if URL generation fails
						}
					}

					return {
						...pet,
						profilePhotoUrl,
					};
				}),
			);

			return ServiceResponse.success<PetListItem[]>("Pets found", petsWithSignedUrls);
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

	// NEW: Retrieves detailed pet info with all photos, events, vaccinations (for GET /pets/:id)
	async findByIdForDetail(id: number): Promise<ServiceResponse<PetDetailResponse | null>> {
		try {
			const pet = await this.petRepository.findByIdForDetailAsync(id);
			if (!pet) {
				return ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			}

			// Generate signed URLs for profile photo
			let profilePhotoUrl: string | null = null;
			if (pet.profilePhotoUrl) {
				try {
					profilePhotoUrl = await s3Service.getPhotoUrl(pet.profilePhotoUrl);
				} catch (error) {
					logger.error(`Failed to generate profile photo URL for pet ${id}: ${(error as Error).message}`);
				}
			}

			// Generate signed URLs for all photos
			const photoUrls = await Promise.all(
				pet.photos.map(async (photoKey) => {
					try {
						return await s3Service.getPhotoUrl(photoKey);
					} catch (error) {
						logger.error(`Failed to generate photo URL for key ${photoKey}: ${(error as Error).message}`);
						return null;
					}
				}),
			);

			// Filter out null URLs (failed generations)
			const validPhotoUrls = photoUrls.filter((url): url is string => url !== null);

			const petWithSignedUrls: PetDetailResponse = {
				...pet,
				profilePhotoUrl,
				photos: validPhotoUrls,
			};

			return ServiceResponse.success<PetDetailResponse>("Pet found", petWithSignedUrls);
		} catch (ex) {
			const errorMessage = `Error finding pet with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding pet.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const petService = new PetService();
