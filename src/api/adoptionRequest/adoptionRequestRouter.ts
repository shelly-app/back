import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	AdoptionRequestSchema,
	CreateAdoptionRequestSchema,
	DeleteAdoptionRequestSchema,
	GetAdoptionRequestSchema,
	GetAdoptionRequestsSchema,
	UpdateAdoptionRequestSchema,
} from "@/api/adoptionRequest/adoptionRequestModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { adoptionRequestController } from "./adoptionRequestController";

export const adoptionRequestRegistry = new OpenAPIRegistry();
export const adoptionRequestRouter: Router = express.Router();

adoptionRequestRegistry.register("AdoptionRequest", AdoptionRequestSchema);

adoptionRequestRegistry.registerPath({
	method: "get",
	path: "/adoption-requests",
	tags: ["AdoptionRequest"],
	request: { query: GetAdoptionRequestsSchema.shape.query },
	responses: createApiResponse(z.array(AdoptionRequestSchema), "Success"),
});

adoptionRequestRouter.get(
	"/",
	validateRequest(GetAdoptionRequestsSchema),
	adoptionRequestController.getAdoptionRequests,
);

adoptionRequestRegistry.registerPath({
	method: "get",
	path: "/adoption-requests/{id}",
	tags: ["AdoptionRequest"],
	request: { params: GetAdoptionRequestSchema.shape.params },
	responses: createApiResponse(AdoptionRequestSchema, "Success"),
});

adoptionRequestRouter.get(
	"/:id",
	validateRequest(GetAdoptionRequestSchema),
	adoptionRequestController.getAdoptionRequest,
);

adoptionRequestRegistry.registerPath({
	method: "post",
	path: "/adoption-requests",
	tags: ["AdoptionRequest"],
	request: { body: { content: { "application/json": { schema: CreateAdoptionRequestSchema.shape.body } } } },
	responses: createApiResponse(AdoptionRequestSchema, "Success"),
});

adoptionRequestRouter.post(
	"/",
	validateRequest(CreateAdoptionRequestSchema),
	adoptionRequestController.createAdoptionRequest,
);

adoptionRequestRegistry.registerPath({
	method: "patch",
	path: "/adoption-requests/{id}",
	tags: ["AdoptionRequest"],
	request: {
		params: UpdateAdoptionRequestSchema.shape.params,
		body: { content: { "application/json": { schema: UpdateAdoptionRequestSchema.shape.body } } },
	},
	responses: createApiResponse(AdoptionRequestSchema, "Success"),
});

adoptionRequestRouter.patch(
	"/:id",
	validateRequest(UpdateAdoptionRequestSchema),
	adoptionRequestController.updateAdoptionRequest,
);

adoptionRequestRegistry.registerPath({
	method: "delete",
	path: "/adoption-requests/{id}",
	tags: ["AdoptionRequest"],
	request: { params: DeleteAdoptionRequestSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

adoptionRequestRouter.delete(
	"/:id",
	validateRequest(DeleteAdoptionRequestSchema),
	adoptionRequestController.deleteAdoptionRequest,
);
