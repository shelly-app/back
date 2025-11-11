import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Event = z.infer<typeof EventSchema>;
export const EventSchema = z.object({
	id: z.number(),
	petId: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	dateTime: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

// Input Validation for 'GET events' endpoint
export const GetEventsSchema = z.object({
	query: z.object({
		petId: z.coerce.number().optional(),
		includeDeleted: z.coerce.boolean().optional(),
	}),
});

// Input Validation for 'GET events/:id' endpoint
export const GetEventSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST events' endpoint
export const CreateEventSchema = z.object({
	body: z.object({
		petId: z.number().int().positive("Pet ID must be a positive integer"),
		name: z.string().min(1, "Name is required"),
		description: z.string().optional().nullable(),
		dateTime: z.string().datetime(),
	}),
});

// Input Validation for 'PATCH events/:id' endpoint
export const UpdateEventSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		name: z.string().min(1).optional(),
		description: z.string().optional().nullable(),
		dateTime: z.string().datetime().optional(),
	}),
});

// Input Validation for 'DELETE events/:id' endpoint
export const DeleteEventSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
