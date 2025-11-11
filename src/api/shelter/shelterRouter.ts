import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateShelterSchema,
	DeleteShelterSchema,
	GetShelterSchema,
	GetSheltersSchema,
	ShelterSchema,
	UpdateShelterSchema,
} from "@/api/shelter/shelterModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { shelterController } from "./shelterController";

export const shelterRegistry = new OpenAPIRegistry();
export const shelterRouter: Router = express.Router();

shelterRegistry.register("Shelter", ShelterSchema);

shelterRegistry.registerPath({
	method: "get",
	path: "/shelters",
	tags: ["Shelter"],
	request: { query: GetSheltersSchema.shape.query },
	responses: createApiResponse(z.array(ShelterSchema), "Success"),
});

shelterRouter.get("/", validateRequest(GetSheltersSchema), shelterController.getShelters);

shelterRegistry.registerPath({
	method: "get",
	path: "/shelters/{id}",
	tags: ["Shelter"],
	request: { params: GetShelterSchema.shape.params },
	responses: createApiResponse(ShelterSchema, "Success"),
});

shelterRouter.get("/:id", validateRequest(GetShelterSchema), shelterController.getShelter);

shelterRegistry.registerPath({
	method: "post",
	path: "/shelters",
	tags: ["Shelter"],
	request: { body: { content: { "application/json": { schema: CreateShelterSchema.shape.body } } } },
	responses: createApiResponse(ShelterSchema, "Success"),
});

shelterRouter.post("/", validateRequest(CreateShelterSchema), shelterController.createShelter);

shelterRegistry.registerPath({
	method: "patch",
	path: "/shelters/{id}",
	tags: ["Shelter"],
	request: {
		params: UpdateShelterSchema.shape.params,
		body: { content: { "application/json": { schema: UpdateShelterSchema.shape.body } } },
	},
	responses: createApiResponse(ShelterSchema, "Success"),
});

shelterRouter.patch("/:id", validateRequest(UpdateShelterSchema), shelterController.updateShelter);

shelterRegistry.registerPath({
	method: "delete",
	path: "/shelters/{id}",
	tags: ["Shelter"],
	request: { params: DeleteShelterSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

shelterRouter.delete("/:id", validateRequest(DeleteShelterSchema), shelterController.deleteShelter);
