import type { Request, RequestHandler, Response } from "express";

import { petService } from "@/api/pet/petService";

class PetController {
	public getPets: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			speciesId: req.query.speciesId ? Number(req.query.speciesId) : undefined,
			statusId: req.query.statusId ? Number(req.query.statusId) : undefined,
			shelterId: req.query.shelterId ? Number(req.query.shelterId) : undefined,
			sizeId: req.query.sizeId ? Number(req.query.sizeId) : undefined,
			colorId: req.query.colorId ? Number(req.query.colorId) : undefined,
		};
		const serviceResponse = await petService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPet: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createPet: RequestHandler = async (req: Request, res: Response) => {
		const petData = req.body;
		const serviceResponse = await petService.create(petData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updatePet: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const petData = req.body;
		const serviceResponse = await petService.update(id, petData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deletePet: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public archivePet: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await petService.archive(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const petController = new PetController();
