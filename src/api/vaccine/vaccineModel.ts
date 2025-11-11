import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Vaccine = z.infer<typeof VaccineSchema>;
export const VaccineSchema = z.object({
	id: z.number(),
	name: z.string(),
	speciesId: z.number(),
	createdAt: z.date(),
});

// Input Validation for 'GET vaccines' endpoint
export const GetVaccinesSchema = z.object({
	query: z.object({
		speciesId: z.coerce.number().optional(),
	}),
});

// Input Validation for 'GET vaccines/:id' endpoint
export const GetVaccineSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST vaccines' endpoint
export const CreateVaccineSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		speciesId: z.number().int().positive("Species ID must be a positive integer"),
	}),
});

// Input Validation for 'DELETE vaccines/:id' endpoint
export const DeleteVaccineSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
