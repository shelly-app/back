import { StatusCodes } from "http-status-codes";

import type { AdoptionRequest } from "@/api/adoptionRequest/adoptionRequestModel";
import { AdoptionRequestRepository } from "@/api/adoptionRequest/adoptionRequestRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface AdoptionRequestFilters {
	petId?: number;
	userId?: number;
	statusId?: number;
}

interface CreateAdoptionRequestData {
	petId: number;
	userId: number;
	statusId: number;
	answers: Record<string, unknown>;
}

interface UpdateAdoptionRequestData {
	statusId?: number;
	answers?: Record<string, unknown>;
}

export class AdoptionRequestService {
	private adoptionRequestRepository: AdoptionRequestRepository;

	constructor(repository: AdoptionRequestRepository = new AdoptionRequestRepository()) {
		this.adoptionRequestRepository = repository;
	}

	// Retrieves all adoption requests from the database with optional filters
	async findAll(filters: AdoptionRequestFilters = {}): Promise<ServiceResponse<AdoptionRequest[] | null>> {
		try {
			const adoptionRequests = await this.adoptionRequestRepository.findAllAsync(filters);
			if (!adoptionRequests || adoptionRequests.length === 0) {
				return ServiceResponse.failure("No Adoption Requests found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<AdoptionRequest[]>("Adoption Requests found", adoptionRequests);
		} catch (ex) {
			const errorMessage = `Error finding all adoption requests: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving adoption requests.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single adoption request by its ID
	async findById(id: number): Promise<ServiceResponse<AdoptionRequest | null>> {
		try {
			const adoptionRequest = await this.adoptionRequestRepository.findByIdAsync(id);
			if (!adoptionRequest) {
				return ServiceResponse.failure("Adoption Request not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<AdoptionRequest>("Adoption Request found", adoptionRequest);
		} catch (ex) {
			const errorMessage = `Error finding adoption request with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding adoption request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Creates a new adoption request
	async create(data: CreateAdoptionRequestData): Promise<ServiceResponse<AdoptionRequest | null>> {
		try {
			const adoptionRequest = await this.adoptionRequestRepository.createAsync(data);
			return ServiceResponse.success<AdoptionRequest>(
				"Adoption Request created successfully",
				adoptionRequest,
				StatusCodes.CREATED,
			);
		} catch (ex) {
			const errorMessage = `Error creating adoption request: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating adoption request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Updates an adoption request by its ID
	async update(id: number, data: UpdateAdoptionRequestData): Promise<ServiceResponse<AdoptionRequest | null>> {
		try {
			const adoptionRequest = await this.adoptionRequestRepository.updateAsync(id, data);
			if (!adoptionRequest) {
				return ServiceResponse.failure("Adoption Request not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<AdoptionRequest>("Adoption Request updated successfully", adoptionRequest);
		} catch (ex) {
			const errorMessage = `Error updating adoption request with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating adoption request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Deletes an adoption request by its ID
	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.adoptionRequestRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Adoption Request not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Adoption Request deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting adoption request with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting adoption request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const adoptionRequestService = new AdoptionRequestService();
