import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type AdoptionRequest = z.infer<typeof AdoptionRequestSchema>;
export const AdoptionRequestSchema = z.object({
	id: z.number(),
	petId: z.number(),
	userId: z.number(),
	statusId: z.number(),
	answers: z.record(z.unknown()),
	adminMessage: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for 'GET adoption-requests' endpoint
export const GetAdoptionRequestsSchema = z.object({
	query: z.object({
		petId: z.coerce.number().optional(),
		userId: z.coerce.number().optional(),
		statusId: z.coerce.number().optional(),
	}),
});

// Input Validation for 'GET adoption-requests/:id' endpoint
export const GetAdoptionRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST adoption-requests' endpoint
export const CreateAdoptionRequestSchema = z.object({
	body: z.object({
		petId: z.number().int().positive("Pet ID must be a positive integer"),
		userId: z.number().int().positive("User ID must be a positive integer"),
		statusId: z.number().int().positive("Status ID must be a positive integer"),
		answers: z.record(z.unknown()),
	}),
});

// Input Validation for 'PATCH adoption-requests/:id' endpoint
export const UpdateAdoptionRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		statusId: z.number().int().positive().optional(),
		answers: z.record(z.unknown()).optional(),
	}),
});

// Input Validation for 'DELETE adoption-requests/:id' endpoint
export const DeleteAdoptionRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST adoption-requests/:id/process' endpoint
export const ProcessAdoptionRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		statusId: z.number().int().min(1).max(3, "Status ID must be between 1 and 3"),
		adminMessage: z.string().optional(),
	}),
});
