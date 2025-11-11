import type { Request, RequestHandler, Response } from "express";

import { vaccinationService } from "@/api/vaccination/vaccinationService";

class VaccinationController {
	public getVaccinations: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			petId: req.query.petId ? Number(req.query.petId) : undefined,
			vaccineId: req.query.vaccineId ? Number(req.query.vaccineId) : undefined,
			includeDeleted: req.query.includeDeleted ? Boolean(req.query.includeDeleted) : undefined,
		};
		const serviceResponse = await vaccinationService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getVaccination: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await vaccinationService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createVaccination: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body;
		const serviceResponse = await vaccinationService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteVaccination: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await vaccinationService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const vaccinationController = new VaccinationController();
