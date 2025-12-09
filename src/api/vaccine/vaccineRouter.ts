import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateVaccineSchema,
	DeleteVaccineSchema,
	GetVaccineSchema,
	GetVaccinesSchema,
	VaccineSchema,
} from "@/api/vaccine/vaccineModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { validateRequest } from "@/common/utils/httpHandlers";
import { vaccineController } from "./vaccineController";

export const vaccineRegistry = new OpenAPIRegistry();
export const vaccineRouter: Router = express.Router();

vaccineRegistry.register("Vaccine", VaccineSchema);

vaccineRegistry.registerPath({
	method: "get",
	path: "/vaccines",
	tags: ["Vaccine"],
	request: { query: GetVaccinesSchema.shape.query },
	responses: createApiResponse(z.array(VaccineSchema), "Success"),
});

vaccineRouter.get("/", validateRequest(GetVaccinesSchema), vaccineController.getVaccines);

vaccineRegistry.registerPath({
	method: "get",
	path: "/vaccines/{id}",
	tags: ["Vaccine"],
	request: { params: GetVaccineSchema.shape.params },
	responses: createApiResponse(VaccineSchema, "Success"),
});

vaccineRouter.get("/:id", validateRequest(GetVaccineSchema), vaccineController.getVaccine);

vaccineRegistry.registerPath({
	method: "post",
	path: "/vaccines",
	tags: ["Vaccine"],
	request: { body: { content: { "application/json": { schema: CreateVaccineSchema.shape.body } } } },
	responses: createApiResponse(VaccineSchema, "Success"),
});

vaccineRouter.post("/", authenticate, validateRequest(CreateVaccineSchema), vaccineController.createVaccine);

vaccineRegistry.registerPath({
	method: "delete",
	path: "/vaccines/{id}",
	tags: ["Vaccine"],
	request: { params: DeleteVaccineSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

vaccineRouter.delete("/:id", authenticate, validateRequest(DeleteVaccineSchema), vaccineController.deleteVaccine);
