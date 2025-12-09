import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { petPhotoService } from "@/api/petPhoto/petPhotoService";
import { ServiceResponse } from "@/common/models/serviceResponse";

class PetPhotoController {
	public getPetPhotos: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			petId: req.query.petId ? Number(req.query.petId) : undefined,
			includeDeleted: req.query.includeDeleted ? Boolean(req.query.includeDeleted) : undefined,
		};
		const serviceResponse = await petPhotoService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPetPhoto: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petPhotoService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPetPhotoUrl: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petPhotoService.getPhotoUrl(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createPetPhoto: RequestHandler = async (req: Request, res: Response) => {
		// Validate file upload
		if (!req.file) {
			const serviceResponse = ServiceResponse.failure("No file uploaded", null, StatusCodes.BAD_REQUEST);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		const data = {
			petId: Number(req.body.petId),
			file: req.file.buffer,
			originalName: req.file.originalname,
			contentType: req.file.mimetype,
		};

		const serviceResponse = await petPhotoService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deletePetPhoto: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petPhotoService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const petPhotoController = new PetPhotoController();
