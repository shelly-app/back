import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	AssignmentSchema,
	CreateAssignmentSchema,
	DeleteAssignmentSchema,
	GetAssignmentSchema,
	GetAssignmentsSchema,
} from "@/api/assignment/assignmentModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { assignmentController } from "./assignmentController";

export const assignmentRegistry = new OpenAPIRegistry();
export const assignmentRouter: Router = express.Router();

assignmentRegistry.register("Assignment", AssignmentSchema);

assignmentRegistry.registerPath({
	method: "get",
	path: "/assignments",
	tags: ["Assignment"],
	request: { query: GetAssignmentsSchema.shape.query },
	responses: createApiResponse(z.array(AssignmentSchema), "Success"),
});

assignmentRouter.get("/", validateRequest(GetAssignmentsSchema), assignmentController.getAssignments);

assignmentRegistry.registerPath({
	method: "get",
	path: "/assignments/{id}",
	tags: ["Assignment"],
	request: { params: GetAssignmentSchema.shape.params },
	responses: createApiResponse(AssignmentSchema, "Success"),
});

assignmentRouter.get("/:id", validateRequest(GetAssignmentSchema), assignmentController.getAssignment);

assignmentRegistry.registerPath({
	method: "post",
	path: "/assignments",
	tags: ["Assignment"],
	request: { body: { content: { "application/json": { schema: CreateAssignmentSchema.shape.body } } } },
	responses: createApiResponse(AssignmentSchema, "Success"),
});

assignmentRouter.post("/", validateRequest(CreateAssignmentSchema), assignmentController.createAssignment);

assignmentRegistry.registerPath({
	method: "delete",
	path: "/assignments/{id}",
	tags: ["Assignment"],
	request: { params: DeleteAssignmentSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

assignmentRouter.delete("/:id", validateRequest(DeleteAssignmentSchema), assignmentController.deleteAssignment);
