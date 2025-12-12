import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	PetColorLookupSchema,
	PetSizeLookupSchema,
	PetSpeciesLookupSchema,
	PetStatusLookupSchema,
	SexLookupSchema,
} from "@/api/lookup/lookupModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { lookupController } from "./lookupController";

export const lookupRegistry = new OpenAPIRegistry();
export const lookupRouter: Router = express.Router();

// Register schemas
lookupRegistry.register("PetSpecies", PetSpeciesLookupSchema);
lookupRegistry.register("Sex", SexLookupSchema);
lookupRegistry.register("PetStatus", PetStatusLookupSchema);
lookupRegistry.register("PetSize", PetSizeLookupSchema);
lookupRegistry.register("PetColor", PetColorLookupSchema);

// GET /lookups/pet-species
lookupRegistry.registerPath({
	method: "get",
	path: "/lookups/pet-species",
	tags: ["Lookup"],
	summary: "Get all pet species",
	responses: createApiResponse(z.array(PetSpeciesLookupSchema), "Success"),
});

lookupRouter.get("/pet-species", lookupController.getPetSpecies);

// GET /lookups/sexes
lookupRegistry.registerPath({
	method: "get",
	path: "/lookups/sexes",
	tags: ["Lookup"],
	summary: "Get all sexes",
	responses: createApiResponse(z.array(SexLookupSchema), "Success"),
});

lookupRouter.get("/sexes", lookupController.getSexes);

// GET /lookups/pet-statuses
lookupRegistry.registerPath({
	method: "get",
	path: "/lookups/pet-statuses",
	tags: ["Lookup"],
	summary: "Get all pet statuses",
	responses: createApiResponse(z.array(PetStatusLookupSchema), "Success"),
});

lookupRouter.get("/pet-statuses", lookupController.getPetStatuses);

// GET /lookups/pet-sizes
lookupRegistry.registerPath({
	method: "get",
	path: "/lookups/pet-sizes",
	tags: ["Lookup"],
	summary: "Get all pet sizes",
	responses: createApiResponse(z.array(PetSizeLookupSchema), "Success"),
});

lookupRouter.get("/pet-sizes", lookupController.getPetSizes);

// GET /lookups/pet-colors
lookupRegistry.registerPath({
	method: "get",
	path: "/lookups/pet-colors",
	tags: ["Lookup"],
	summary: "Get all pet colors",
	responses: createApiResponse(z.array(PetColorLookupSchema), "Success"),
});

lookupRouter.get("/pet-colors", lookupController.getPetColors);
