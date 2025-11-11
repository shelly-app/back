import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Assignment = z.infer<typeof AssignmentSchema>;
export const AssignmentSchema = z.object({
	id: z.number(),
	userId: z.number(),
	roleId: z.number(),
	shelterId: z.number(),
});

// Input Validation for 'GET assignments' endpoint
export const GetAssignmentsSchema = z.object({
	query: z.object({
		userId: z.coerce.number().optional(),
		roleId: z.coerce.number().optional(),
		shelterId: z.coerce.number().optional(),
	}),
});

// Input Validation for 'GET assignments/:id' endpoint
export const GetAssignmentSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST assignments' endpoint
export const CreateAssignmentSchema = z.object({
	body: z.object({
		userId: z.number().int().positive("User ID must be a positive integer"),
		roleId: z.number().int().positive("Role ID must be a positive integer"),
		shelterId: z.number().int().positive("Shelter ID must be a positive integer"),
	}),
});

// Input Validation for 'DELETE assignments/:id' endpoint
export const DeleteAssignmentSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
