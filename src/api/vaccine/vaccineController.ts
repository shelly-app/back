import type { Request, RequestHandler, Response } from "express";

import { vaccineService } from "@/api/vaccine/vaccineService";

class VaccineController {
	public getVaccines: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			speciesId: req.query.speciesId ? Number(req.query.speciesId) : undefined,
		};
		const serviceResponse = await vaccineService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getVaccine: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await vaccineService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createVaccine: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body;
		const serviceResponse = await vaccineService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteVaccine: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await vaccineService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const vaccineController = new VaccineController();
