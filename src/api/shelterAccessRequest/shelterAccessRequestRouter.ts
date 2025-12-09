import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateShelterAccessRequestSchema,
	GetShelterAccessRequestSchema,
	GetShelterAccessRequestsSchema,
	ShelterAccessRequestSchema,
	UpdateShelterAccessRequestSchema,
} from "@/api/shelterAccessRequest/shelterAccessRequestModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { authorize } from "@/common/middleware/authorize";
import { validateRequest } from "@/common/utils/httpHandlers";
import { shelterAccessRequestController } from "./shelterAccessRequestController";

export const shelterAccessRequestRegistry = new OpenAPIRegistry();
export const shelterAccessRequestRouter: Router = express.Router();

shelterAccessRequestRegistry.register("ShelterAccessRequest", ShelterAccessRequestSchema);

// Public endpoint - submit shelter access request
shelterAccessRequestRegistry.registerPath({
	method: "post",
	path: "/shelter-access-requests",
	tags: ["ShelterAccessRequest"],
	request: { body: { content: { "application/json": { schema: CreateShelterAccessRequestSchema.shape.body } } } },
	responses: createApiResponse(ShelterAccessRequestSchema, "Success"),
});

shelterAccessRequestRouter.post(
	"/",
	validateRequest(CreateShelterAccessRequestSchema),
	shelterAccessRequestController.createShelterAccessRequest,
);

// Admin endpoints - manage shelter access requests
shelterAccessRequestRegistry.registerPath({
	method: "get",
	path: "/shelter-access-requests",
	tags: ["ShelterAccessRequest"],
	request: { query: GetShelterAccessRequestsSchema.shape.query },
	responses: createApiResponse(z.array(ShelterAccessRequestSchema), "Success"),
});

shelterAccessRequestRouter.get(
	"/",
	authenticate,
	authorize(["admin"]),
	validateRequest(GetShelterAccessRequestsSchema),
	shelterAccessRequestController.getShelterAccessRequests,
);

shelterAccessRequestRegistry.registerPath({
	method: "get",
	path: "/shelter-access-requests/{id}",
	tags: ["ShelterAccessRequest"],
	request: { params: GetShelterAccessRequestSchema.shape.params },
	responses: createApiResponse(ShelterAccessRequestSchema, "Success"),
});

shelterAccessRequestRouter.get(
	"/:id",
	authenticate,
	authorize(["admin"]),
	validateRequest(GetShelterAccessRequestSchema),
	shelterAccessRequestController.getShelterAccessRequest,
);

shelterAccessRequestRegistry.registerPath({
	method: "patch",
	path: "/shelter-access-requests/{id}",
	tags: ["ShelterAccessRequest"],
	request: {
		params: UpdateShelterAccessRequestSchema.shape.params,
		body: { content: { "application/json": { schema: UpdateShelterAccessRequestSchema.shape.body } } },
	},
	responses: createApiResponse(ShelterAccessRequestSchema, "Success"),
});

shelterAccessRequestRouter.patch(
	"/:id",
	authenticate,
	authorize(["admin"]),
	validateRequest(UpdateShelterAccessRequestSchema),
	shelterAccessRequestController.updateShelterAccessRequest,
);
