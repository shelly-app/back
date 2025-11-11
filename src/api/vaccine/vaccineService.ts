import { StatusCodes } from "http-status-codes";

import type { Vaccine } from "@/api/vaccine/vaccineModel";
import { VaccineRepository } from "@/api/vaccine/vaccineRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface VaccineFilters {
	speciesId?: number;
}

interface CreateVaccineData {
	name: string;
	speciesId: number;
}

export class VaccineService {
	private vaccineRepository: VaccineRepository;

	constructor(repository: VaccineRepository = new VaccineRepository()) {
		this.vaccineRepository = repository;
	}

	async findAll(filters: VaccineFilters = {}): Promise<ServiceResponse<Vaccine[] | null>> {
		try {
			const vaccines = await this.vaccineRepository.findAllAsync(filters);
			if (!vaccines || vaccines.length === 0) {
				return ServiceResponse.failure("No Vaccines found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Vaccine[]>("Vaccines found", vaccines);
		} catch (ex) {
			const errorMessage = `Error finding all vaccines: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving vaccines.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: number): Promise<ServiceResponse<Vaccine | null>> {
		try {
			const vaccine = await this.vaccineRepository.findByIdAsync(id);
			if (!vaccine) {
				return ServiceResponse.failure("Vaccine not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Vaccine>("Vaccine found", vaccine);
		} catch (ex) {
			const errorMessage = `Error finding vaccine with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding vaccine.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreateVaccineData): Promise<ServiceResponse<Vaccine | null>> {
		try {
			const vaccine = await this.vaccineRepository.createAsync(data);
			return ServiceResponse.success<Vaccine>("Vaccine created successfully", vaccine, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating vaccine: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating vaccine.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.vaccineRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Vaccine not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Vaccine deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting vaccine with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting vaccine.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const vaccineService = new VaccineService();
