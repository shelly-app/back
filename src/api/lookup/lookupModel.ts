import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Pet species lookup
export const PetSpeciesLookupSchema = z
	.object({
		id: z.number(),
		species: z.string(),
	})
	.openapi("PetSpecies");

export type PetSpeciesLookup = z.infer<typeof PetSpeciesLookupSchema>;

// Sex lookup
export const SexLookupSchema = z
	.object({
		id: z.number(),
		sex: z.string(),
	})
	.openapi("Sex");

export type SexLookup = z.infer<typeof SexLookupSchema>;

// Pet status lookup
export const PetStatusLookupSchema = z
	.object({
		id: z.number(),
		status: z.string(),
	})
	.openapi("PetStatus");

export type PetStatusLookup = z.infer<typeof PetStatusLookupSchema>;

// Pet size lookup
export const PetSizeLookupSchema = z
	.object({
		id: z.number(),
		size: z.string(),
	})
	.openapi("PetSize");

export type PetSizeLookup = z.infer<typeof PetSizeLookupSchema>;

// Pet color lookup
export const PetColorLookupSchema = z
	.object({
		id: z.number(),
		color: z.string(),
	})
	.openapi("PetColor");

export type PetColorLookup = z.infer<typeof PetColorLookupSchema>;
