import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	ArchivePetSchema,
	CreatePetSchema,
	DeletePetSchema,
	GetPetSchema,
	GetPetsSchema,
	PetDetailSchema,
	PetSchema,
	UpdatePetSchema,
} from "@/api/pet/petModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { petController } from "./petController";
import { authenticate } from "@/common/middleware/authenticate";
import { authorize } from "@/common/middleware/authorize";
import { attachPetShelterContext } from "@/common/middleware/shelterContext";

export const petRegistry = new OpenAPIRegistry();
export const petRouter: Router = express.Router();

petRegistry.register("Pet", PetSchema);
petRegistry.register("PetDetail", PetDetailSchema);

petRegistry.registerPath({
	method: "get",
	path: "/pets",
	tags: ["Pet"],
	request: { query: GetPetsSchema.shape.query },
	responses: createApiResponse(z.array(PetSchema), "Success"),
});

petRouter.get("/", validateRequest(GetPetsSchema), petController.getPets);

petRegistry.registerPath({
	method: "get",
	path: "/pets/{id}",
	tags: ["Pet"],
	request: { params: GetPetSchema.shape.params },
	responses: createApiResponse(PetDetailSchema, "Success"),
});

petRouter.get("/:id", validateRequest(GetPetSchema), petController.getPet);

petRegistry.registerPath({
	method: "post",
	path: "/pets",
	tags: ["Pet"],
	request: { body: { content: { "application/json": { schema: CreatePetSchema.shape.body } } } },
	responses: createApiResponse(PetSchema, "Success"),
});

petRouter.post("/", validateRequest(CreatePetSchema), petController.createPet);

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

petRouter.patch("/:id", validateRequest(UpdatePetSchema), petController.updatePet);

petRegistry.registerPath({
	method: "delete",
	path: "/pets/{id}",
	tags: ["Pet"],
	request: { params: DeletePetSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

petRouter.delete("/:id", validateRequest(DeletePetSchema), petController.deletePet);

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
