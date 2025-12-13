import type { Request, RequestHandler, Response } from "express";

import { lookupService } from "@/api/lookup/lookupService";

class LookupController {
	public getPetSpecies: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await lookupService.getPetSpecies();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getSexes: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await lookupService.getSexes();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPetStatuses: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await lookupService.getPetStatuses();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPetSizes: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await lookupService.getPetSizes();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getPetColors: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await lookupService.getPetColors();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const lookupController = new LookupController();
