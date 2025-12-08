import type { Request, RequestHandler, Response } from "express";

import { adoptionRequestService } from "@/api/adoptionRequest/adoptionRequestService";

class AdoptionRequestController {
	public getAdoptionRequests: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			petId: req.query.petId ? Number(req.query.petId) : undefined,
			userId: req.query.userId ? Number(req.query.userId) : undefined,
			statusId: req.query.statusId ? Number(req.query.statusId) : undefined,
		};
		const serviceResponse = await adoptionRequestService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getAdoptionRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await adoptionRequestService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createAdoptionRequest: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body;
		const serviceResponse = await adoptionRequestService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateAdoptionRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const data = req.body;
		const serviceResponse = await adoptionRequestService.update(id, data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteAdoptionRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await adoptionRequestService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public processAdoptionRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const { statusId, adminMessage } = req.body;
		const serviceResponse = await adoptionRequestService.process(id, statusId, adminMessage);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const adoptionRequestController = new AdoptionRequestController();
