import { StatusCodes } from "http-status-codes";

import type {
	PetColorLookup,
	PetSizeLookup,
	PetSpeciesLookup,
	PetStatusLookup,
	SexLookup,
} from "@/api/lookup/lookupModel";
import { lookupRepository } from "@/api/lookup/lookupRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class LookupService {
	async getPetSpecies(): Promise<ServiceResponse<PetSpeciesLookup[]>> {
		try {
			const species = await lookupRepository.findAllPetSpeciesAsync();
			return ServiceResponse.success("Pet species retrieved", species);
		} catch (error) {
			logger.error(error);
			return ServiceResponse.failure("Error retrieving pet species", [], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getSexes(): Promise<ServiceResponse<SexLookup[]>> {
		try {
			const sexes = await lookupRepository.findAllSexesAsync();
			return ServiceResponse.success("Sexes retrieved", sexes);
		} catch (error) {
			logger.error(error);
			return ServiceResponse.failure("Error retrieving sexes", [], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getPetStatuses(): Promise<ServiceResponse<PetStatusLookup[]>> {
		try {
			const statuses = await lookupRepository.findAllPetStatusesAsync();
			return ServiceResponse.success("Pet statuses retrieved", statuses);
		} catch (error) {
			logger.error(error);
			return ServiceResponse.failure("Error retrieving pet statuses", [], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getPetSizes(): Promise<ServiceResponse<PetSizeLookup[]>> {
		try {
			const sizes = await lookupRepository.findAllPetSizesAsync();
			return ServiceResponse.success("Pet sizes retrieved", sizes);
		} catch (error) {
			logger.error(error);
			return ServiceResponse.failure("Error retrieving pet sizes", [], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getPetColors(): Promise<ServiceResponse<PetColorLookup[]>> {
		try {
			const colors = await lookupRepository.findAllPetColorsAsync();
			return ServiceResponse.success("Pet colors retrieved", colors);
		} catch (error) {
			logger.error(error);
			return ServiceResponse.failure("Error retrieving pet colors", [], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const lookupService = new LookupService();
