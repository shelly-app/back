import { StatusCodes } from "http-status-codes";

import type { Vaccination } from "@/api/vaccination/vaccinationModel";
import { VaccinationRepository } from "@/api/vaccination/vaccinationRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface VaccinationFilters {
	petId?: number;
	vaccineId?: number;
	includeDeleted?: boolean;
}

interface CreateVaccinationData {
	vaccineId: number;
	petId: number;
}

export class VaccinationService {
	private vaccinationRepository: VaccinationRepository;

	constructor(repository: VaccinationRepository = new VaccinationRepository()) {
		this.vaccinationRepository = repository;
	}

	async findAll(filters: VaccinationFilters = {}): Promise<ServiceResponse<Vaccination[] | null>> {
		try {
			const vaccinations = await this.vaccinationRepository.findAllAsync(filters);
			if (!vaccinations || vaccinations.length === 0) {
				return ServiceResponse.failure("No Vaccinations found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Vaccination[]>("Vaccinations found", vaccinations);
		} catch (ex) {
			const errorMessage = `Error finding all vaccinations: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving vaccinations.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: number): Promise<ServiceResponse<Vaccination | null>> {
		try {
			const vaccination = await this.vaccinationRepository.findByIdAsync(id);
			if (!vaccination) {
				return ServiceResponse.failure("Vaccination not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Vaccination>("Vaccination found", vaccination);
		} catch (ex) {
			const errorMessage = `Error finding vaccination with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding vaccination.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreateVaccinationData): Promise<ServiceResponse<Vaccination | null>> {
		try {
			const vaccination = await this.vaccinationRepository.createAsync(data);
			return ServiceResponse.success<Vaccination>("Vaccination created successfully", vaccination, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating vaccination: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating vaccination.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.vaccinationRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Vaccination not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Vaccination deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting vaccination with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting vaccination.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const vaccinationService = new VaccinationService();
