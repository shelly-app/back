import type { Request, RequestHandler, Response } from "express";

import { shelterAccessRequestService } from "@/api/shelterAccessRequest/shelterAccessRequestService";

class ShelterAccessRequestController {
	public getShelterAccessRequests: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			status: req.query.status as "pending" | "approved" | "rejected" | undefined,
		};
		const serviceResponse = await shelterAccessRequestService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getShelterAccessRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await shelterAccessRequestService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createShelterAccessRequest: RequestHandler = async (req: Request, res: Response) => {
		const requestData = req.body;
		const serviceResponse = await shelterAccessRequestService.create(requestData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateShelterAccessRequest: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const requestData = req.body;
		const serviceResponse = await shelterAccessRequestService.update(id, requestData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const shelterAccessRequestController = new ShelterAccessRequestController();
