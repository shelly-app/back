import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Vaccination = z.infer<typeof VaccinationSchema>;
export const VaccinationSchema = z.object({
	id: z.number(),
	vaccineId: z.number(),
	petId: z.number(),
	createdAt: z.date(),
	deletedAt: z.date().nullable(),
});

// Input Validation for 'GET vaccinations' endpoint
export const GetVaccinationsSchema = z.object({
	query: z.object({
		petId: z.coerce.number().optional(),
		vaccineId: z.coerce.number().optional(),
		includeDeleted: z.coerce.boolean().optional(),
	}),
});

// Input Validation for 'GET vaccinations/:id' endpoint
export const GetVaccinationSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST vaccinations' endpoint
export const CreateVaccinationSchema = z.object({
	body: z.object({
		vaccineId: z.number().int().positive("Vaccine ID must be a positive integer"),
		petId: z.number().int().positive("Pet ID must be a positive integer"),
	}),
});

// Input Validation for 'DELETE vaccinations/:id' endpoint
export const DeleteVaccinationSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
