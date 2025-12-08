import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Shelter = z.infer<typeof ShelterSchema>;
export const ShelterSchema = z.object({
	id: z.number(),
	name: z.string(),
	address: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	country: z.string().nullable(),
	zip: z.number().nullable(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

// Input Validation for 'GET shelters' endpoint
export const GetSheltersSchema = z.object({
	query: z.object({
		city: z.string().optional(),
		state: z.string().optional(),
		country: z.string().optional(),
		includeDeleted: z.coerce.boolean().optional(),
	}),
});

// Input Validation for 'GET shelters/:id' endpoint
export const GetShelterSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST shelters' endpoint
export const CreateShelterSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		address: z.string().optional().nullable(),
		city: z.string().optional().nullable(),
		state: z.string().optional().nullable(),
		country: z.string().optional().nullable(),
		zip: z.number().int().optional().nullable(),
		latitude: z.number().optional().nullable(),
		longitude: z.number().optional().nullable(),
	}),
});

// Input Validation for 'PATCH shelters/:id' endpoint
export const UpdateShelterSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		name: z.string().min(1).optional(),
		address: z.string().optional().nullable(),
		city: z.string().optional().nullable(),
		state: z.string().optional().nullable(),
		country: z.string().optional().nullable(),
		zip: z.number().int().optional().nullable(),
		latitude: z.number().optional().nullable(),
		longitude: z.number().optional().nullable(),
	}),
});

// Input Validation for 'DELETE shelters/:id' endpoint
export const DeleteShelterSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Shelter member schema (user with role in shelter)
export type ShelterMember = z.infer<typeof ShelterMemberSchema>;
export const ShelterMemberSchema = z.object({
	userId: z.number(),
	userName: z.string(),
	userEmail: z.string().email(),
	roleId: z.number(),
	roleName: z.string(),
	assignmentId: z.number(),
});

// Input Validation for 'GET shelters/:id/members' endpoint
export const GetShelterMembersSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST shelters/:id/invite' endpoint
export const InviteMemberSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		email: z.string().email("Valid email is required"),
		roleName: z.enum(["admin", "member"], { errorMap: () => ({ message: "Role must be 'admin' or 'member'" }) }),
	}),
});
