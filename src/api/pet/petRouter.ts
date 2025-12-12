import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	ArchivePetSchema,
	CreatePetSchema,
	DeletePetSchema,
	GetPetSchema,
	GetPetsSchema,
	PetDetailResponseSchema,
	PetDetailSchema,
	PetListItemSchema,
	PetSchema,
	UpdatePetSchema,
} from "@/api/pet/petModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { authorize } from "@/common/middleware/authorize";
import { attachPetShelterContext } from "@/common/middleware/shelterContext";
import { validateRequest } from "@/common/utils/httpHandlers";
import { petController } from "./petController";

export const petRegistry = new OpenAPIRegistry();
export const petRouter: Router = express.Router();

petRegistry.register("Pet", PetSchema);
petRegistry.register("PetDetail", PetDetailSchema);
petRegistry.register("PetListItem", PetListItemSchema);
petRegistry.register("PetDetailResponse", PetDetailResponseSchema);

petRegistry.registerPath({
	method: "get",
	path: "/pets",
	tags: ["Pet"],
	request: { query: GetPetsSchema.shape.query },
	responses: createApiResponse(z.array(PetListItemSchema), "Success"),
});

petRouter.get("/", validateRequest(GetPetsSchema), petController.getPets);

petRegistry.registerPath({
	method: "get",
	path: "/pets/{id}",
	tags: ["Pet"],
	request: { params: GetPetSchema.shape.params },
	responses: createApiResponse(PetDetailResponseSchema, "Success"),
});

petRouter.get("/:id", validateRequest(GetPetSchema), petController.getPet);

petRegistry.registerPath({
	method: "post",
	path: "/pets",
	tags: ["Pet"],
	request: { body: { content: { "application/json": { schema: CreatePetSchema.shape.body } } } },
	responses: createApiResponse(PetSchema, "Success"),
});

petRouter.post(
	"/",
	authenticate,
	authorize(["admin", "member"], "body"),
	validateRequest(CreatePetSchema),
	petController.createPet,
);

petRegistry.registerPath({
	method: "patch",
	path: "/pets/{id}",
	tags: ["Pet"],
	request: {
		params: UpdatePetSchema.shape.params,
		body: { content: { "application/json": { schema: UpdatePetSchema.shape.body } } },
	},
	responses: createApiResponse(PetSchema, "Success"),
});

petRouter.patch(
	"/:id",
	authenticate,
	attachPetShelterContext,
	authorize(["admin", "member"], "params"),
	validateRequest(UpdatePetSchema),
	petController.updatePet,
);

petRegistry.registerPath({
	method: "delete",
	path: "/pets/{id}",
	tags: ["Pet"],
	request: { params: DeletePetSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

petRouter.delete(
	"/:id",
	authenticate,
	attachPetShelterContext,
	authorize(["admin"], "params"),
	validateRequest(DeletePetSchema),
	petController.deletePet,
);

petRegistry.registerPath({
	method: "post",
	path: "/pets/{id}/archive",
	tags: ["Pet"],
	request: { params: ArchivePetSchema.shape.params },
	responses: createApiResponse(PetSchema, "Success"),
});

petRouter.post(
	"/:id/archive",
	authenticate,
	attachPetShelterContext,
	authorize(["admin"], "params"),
	validateRequest(ArchivePetSchema),
	petController.archivePet,
);
