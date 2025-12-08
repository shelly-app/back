import type { Request, RequestHandler, Response } from "express";

import { shelterService } from "@/api/shelter/shelterService";
import type { RoleName } from "@/common/utils/roleHelpers";

class ShelterController {
	public getShelters: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			city: req.query.city as string | undefined,
			state: req.query.state as string | undefined,
			country: req.query.country as string | undefined,
			includeDeleted: req.query.includeDeleted ? Boolean(req.query.includeDeleted) : undefined,
		};
		const serviceResponse = await shelterService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getShelter: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await shelterService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createShelter: RequestHandler = async (req: Request, res: Response) => {
		const shelterData = req.body;
		const serviceResponse = await shelterService.create(shelterData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateShelter: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const shelterData = req.body;
		const serviceResponse = await shelterService.update(id, shelterData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteShelter: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await shelterService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getShelterMembers: RequestHandler = async (req: Request, res: Response) => {
		const shelterId = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await shelterService.getMembers(shelterId);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public inviteMember: RequestHandler = async (req: Request, res: Response) => {
		const shelterId = Number.parseInt(req.params.id as string, 10);
		const { email, roleName } = req.body as { email: string; roleName: RoleName };
		const inviterName = req.user?.name || "Unknown";
		const serviceResponse = await shelterService.inviteMember(shelterId, email, roleName, inviterName);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const shelterController = new ShelterController();
