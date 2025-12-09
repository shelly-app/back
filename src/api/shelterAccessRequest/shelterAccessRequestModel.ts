import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type ShelterAccessRequest = z.infer<typeof ShelterAccessRequestSchema>;
export const ShelterAccessRequestSchema = z.object({
	id: z.number(),
	shelterName: z.string(),
	shelterType: z.string(),
	country: z.string(),
	state: z.string(),
	city: z.string(),
	contactName: z.string(),
	contactEmail: z.string().email(),
	contactPhone: z.string(),
	message: z.string(),
	status: z.enum(["pending", "approved", "rejected"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for 'GET shelter-access-requests' endpoint
export const GetShelterAccessRequestsSchema = z.object({
	query: z.object({
		status: z.enum(["pending", "approved", "rejected"]).optional(),
	}),
});

// Input Validation for 'GET shelter-access-requests/:id' endpoint
export const GetShelterAccessRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST shelter-access-requests' endpoint (public)
export const CreateShelterAccessRequestSchema = z.object({
	body: z.object({
		shelterName: z.string().min(1, "Shelter name is required"),
		shelterType: z.string().min(1, "Shelter type is required"),
		country: z.string().min(1, "Country is required"),
		state: z.string().min(1, "State is required"),
		city: z.string().min(1, "City is required"),
		contactName: z.string().min(1, "Contact name is required"),
		contactEmail: z.string().email("Valid email is required"),
		contactPhone: z.string().min(1, "Contact phone is required"),
		message: z.string().min(1, "Message is required"),
	}),
});

// Input Validation for 'PATCH shelter-access-requests/:id' endpoint (admin only)
export const UpdateShelterAccessRequestSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		status: z.enum(["pending", "approved", "rejected"]),
	}),
});
