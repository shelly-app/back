import { StatusCodes } from "http-status-codes";

import type { ShelterAccessRequest } from "@/api/shelterAccessRequest/shelterAccessRequestModel";
import { ShelterAccessRequestRepository } from "@/api/shelterAccessRequest/shelterAccessRequestRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface ShelterAccessRequestFilters {
	status?: "pending" | "approved" | "rejected";
}

interface CreateShelterAccessRequestData {
	shelterName: string;
	shelterType: string;
	country: string;
	state: string;
	city: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	message: string;
}

interface UpdateShelterAccessRequestData {
	status: "pending" | "approved" | "rejected";
}

export class ShelterAccessRequestService {
	private shelterAccessRequestRepository: ShelterAccessRequestRepository;

	constructor(repository: ShelterAccessRequestRepository = new ShelterAccessRequestRepository()) {
		this.shelterAccessRequestRepository = repository;
	}

	// Retrieves all shelter access requests from the database with optional filters
	async findAll(filters: ShelterAccessRequestFilters = {}): Promise<ServiceResponse<ShelterAccessRequest[] | null>> {
		try {
			const requests = await this.shelterAccessRequestRepository.findAllAsync(filters);
			if (!requests || requests.length === 0) {
				return ServiceResponse.failure("No shelter access requests found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<ShelterAccessRequest[]>("Shelter access requests found", requests);
		} catch (ex) {
			const errorMessage = `Error finding all shelter access requests: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving shelter access requests.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single shelter access request by ID
	async findById(id: number): Promise<ServiceResponse<ShelterAccessRequest | null>> {
		try {
			const request = await this.shelterAccessRequestRepository.findByIdAsync(id);
			if (!request) {
				return ServiceResponse.failure("Shelter access request not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<ShelterAccessRequest>("Shelter access request found", request);
		} catch (ex) {
			const errorMessage = `Error finding shelter access request with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding shelter access request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Creates a new shelter access request (public endpoint)
	async create(requestData: CreateShelterAccessRequestData): Promise<ServiceResponse<ShelterAccessRequest | null>> {
		try {
			const request = await this.shelterAccessRequestRepository.createAsync(requestData);
			return ServiceResponse.success<ShelterAccessRequest>(
				"Shelter access request submitted successfully",
				request,
				StatusCodes.CREATED,
			);
		} catch (ex) {
			const errorMessage = `Error creating shelter access request: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while submitting shelter access request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Updates a shelter access request status (admin only)
	async update(
		id: number,
		requestData: UpdateShelterAccessRequestData,
	): Promise<ServiceResponse<ShelterAccessRequest | null>> {
		try {
			const request = await this.shelterAccessRequestRepository.updateAsync(id, requestData);
			if (!request) {
				return ServiceResponse.failure("Shelter access request not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<ShelterAccessRequest>("Shelter access request updated successfully", request);
		} catch (ex) {
			const errorMessage = `Error updating shelter access request with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating shelter access request.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const shelterAccessRequestService = new ShelterAccessRequestService();
