import type { Request, RequestHandler, Response } from "express";

import { assignmentService } from "@/api/assignment/assignmentService";

class AssignmentController {
	public getAssignments: RequestHandler = async (req: Request, res: Response) => {
		const filters = {
			userId: req.query.userId ? Number(req.query.userId) : undefined,
			roleId: req.query.roleId ? Number(req.query.roleId) : undefined,
			shelterId: req.query.shelterId ? Number(req.query.shelterId) : undefined,
		};
		const serviceResponse = await assignmentService.findAll(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getAssignment: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await assignmentService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createAssignment: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body;
		const serviceResponse = await assignmentService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteAssignment: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await assignmentService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const assignmentController = new AssignmentController();
