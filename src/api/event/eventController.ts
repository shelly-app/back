import type { Request, RequestHandler, Response } from "express";

import { eventService } from "@/api/event/eventService";

class EventController {
	public getEvents: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			petId: req.query.petId ? Number(req.query.petId) : undefined,
			includeDeleted: req.query.includeDeleted ? Boolean(req.query.includeDeleted) : undefined,
		};
		const serviceResponse = await eventService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getEvent: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await eventService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createEvent: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body;
		const serviceResponse = await eventService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateEvent: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const data = req.body;
		const serviceResponse = await eventService.update(id, data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteEvent: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await eventService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const eventController = new EventController();
