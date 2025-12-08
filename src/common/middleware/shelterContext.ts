import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { petService } from "@/api/pet/petService";

/**
 * Middleware to attach shelter context from pet ID
 * Infers shelter ID from the pet being accessed
 *
 * Use this before authorize middleware when operating on pet resources
 * Example: PATCH /pets/:id - need to know which shelter the pet belongs to
 */
export const attachPetShelterContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const petId = req.params.id ? Number(req.params.id) : undefined;

		if (!petId) {
			const response = ServiceResponse.failure("Pet ID is required", null, StatusCodes.BAD_REQUEST);
			res.status(response.statusCode).send(response);
			return;
		}

		// Fetch pet to get shelter ID
		const petResult = await petService.findById(petId);

		if (!petResult.success || !petResult.responseObject) {
			const response = ServiceResponse.failure("Pet not found", null, StatusCodes.NOT_FOUND);
			res.status(response.statusCode).send(response);
			return;
		}

		// Attach shelter ID to params so authorize middleware can use it
		req.params.shelterId = petResult.responseObject.shelterId.toString();

		next();
	} catch (error) {
		const response = ServiceResponse.failure("Failed to determine shelter context", null, StatusCodes.INTERNAL_SERVER_ERROR);
		res.status(response.statusCode).send(response);
	}
};

/**
 * Middleware to attach shelter context from adoption request ID
 * Infers shelter ID from the adoption request -> pet -> shelter chain
 *
 * Use this before authorize middleware when operating on adoption request resources
 */
export const attachAdoptionRequestShelterContext = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// This will be implemented when we add adoption request processing
		// For now, adoption requests will need shelter ID passed explicitly
		next();
	} catch (error) {
		const response = ServiceResponse.failure("Failed to determine shelter context", null, StatusCodes.INTERNAL_SERVER_ERROR);
		res.status(response.statusCode).send(response);
	}
};
