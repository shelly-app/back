import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateVaccinationSchema,
	DeleteVaccinationSchema,
	GetVaccinationSchema,
	GetVaccinationsSchema,
	VaccinationSchema,
} from "@/api/vaccination/vaccinationModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { vaccinationController } from "./vaccinationController";

export const vaccinationRegistry = new OpenAPIRegistry();
export const vaccinationRouter: Router = express.Router();

vaccinationRegistry.register("Vaccination", VaccinationSchema);

vaccinationRegistry.registerPath({
	method: "get",
	path: "/vaccinations",
	tags: ["Vaccination"],
	request: { query: GetVaccinationsSchema.shape.query },
	responses: createApiResponse(z.array(VaccinationSchema), "Success"),
});

vaccinationRouter.get("/", validateRequest(GetVaccinationsSchema), vaccinationController.getVaccinations);

vaccinationRegistry.registerPath({
	method: "get",
	path: "/vaccinations/{id}",
	tags: ["Vaccination"],
	request: { params: GetVaccinationSchema.shape.params },
	responses: createApiResponse(VaccinationSchema, "Success"),
});

vaccinationRouter.get("/:id", validateRequest(GetVaccinationSchema), vaccinationController.getVaccination);

vaccinationRegistry.registerPath({
	method: "post",
	path: "/vaccinations",
	tags: ["Vaccination"],
	request: { body: { content: { "application/json": { schema: CreateVaccinationSchema.shape.body } } } },
	responses: createApiResponse(VaccinationSchema, "Success"),
});

vaccinationRouter.post("/", validateRequest(CreateVaccinationSchema), vaccinationController.createVaccination);

vaccinationRegistry.registerPath({
	method: "delete",
	path: "/vaccinations/{id}",
	tags: ["Vaccination"],
	request: { params: DeleteVaccinationSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

vaccinationRouter.delete("/:id", validateRequest(DeleteVaccinationSchema), vaccinationController.deleteVaccination);
