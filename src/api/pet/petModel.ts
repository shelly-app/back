import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { EventSchema } from "@/api/event/eventModel";
import { VaccinationSchema } from "@/api/vaccination/vaccinationModel";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Pet color schema (for junction table)
export const PetColorSchema = z.object({
	id: z.number(),
	color: z.string(),
});

// Lookup schemas for nested objects
export const PetSpeciesSchema = z.object({
	id: z.number(),
	species: z.string(),
});

export const SexSchema = z.object({
	id: z.number(),
	sex: z.string(),
});

export const PetStatusSchema = z.object({
	id: z.number(),
	status: z.string(),
});

export const PetSizeSchema = z.object({
	id: z.number(),
	size: z.string(),
});

// Pet with all related data
export type Pet = z.infer<typeof PetSchema>;
export const PetSchema = z.object({
	id: z.number(),
	name: z.string(),
	birthdate: z.string().nullable(),
	breed: z.string().nullable(),
	species: PetSpeciesSchema,
	sex: SexSchema,
	status: PetStatusSchema,
	size: PetSizeSchema,
	description: z.string().nullable(),
	shelterId: z.number(),
	colors: z.array(PetColorSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Vaccination with vaccine name
export const VaccinationWithVaccineNameSchema = VaccinationSchema.extend({
	vaccineName: z.string(),
});

// Pet with detailed information including events and vaccinations
export type PetDetail = z.infer<typeof PetDetailSchema>;
export const PetDetailSchema = PetSchema.extend({
	events: z.array(EventSchema),
	vaccinations: z.array(VaccinationWithVaccineNameSchema),
});

// Pet list item (simplified response for GET /pets)
export type PetListItem = z.infer<typeof PetListItemSchema>;
export const PetListItemSchema = z.object({
	id: z.number(),
	name: z.string(),
	species: z.string(),
	breed: z.string().nullable(),
	status: z.string(),
	profilePhotoUrl: z.string().nullable(),
});

// Pet detail response (complete info for GET /pets/:id)
export type PetDetailResponse = z.infer<typeof PetDetailResponseSchema>;
export const PetDetailResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	species: z.string(),
	breed: z.string().nullable(),
	status: z.string(),
	birthdate: z.string().nullable(),
	sex: z.string(),
	size: z.string(),
	description: z.string().nullable(),
	profilePhotoUrl: z.string().nullable(),
	colors: z.array(z.string()),
	photos: z.array(z.string()),
	events: z.array(EventSchema),
	vaccinations: z.array(VaccinationWithVaccineNameSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for 'GET pets' endpoint
export const GetPetsSchema = z.object({
	query: z.object({
		speciesId: z.coerce.number().optional(),
		statusId: z.coerce.number().optional(),
		shelterId: z.coerce.number().optional(),
		sizeId: z.coerce.number().optional(),
		colorId: z.coerce.number().optional(),
	}),
});

// Input Validation for 'GET pets/:id' endpoint
export const GetPetSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST pets' endpoint
export const CreatePetSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		birthdate: z.string().date().optional().nullable(),
		breed: z.string().optional().nullable(),
		speciesId: z.number().int().positive("Species ID must be a positive integer"),
		sexId: z.number().int().positive("Sex ID must be a positive integer"),
		statusId: z.number().int().positive("Status ID must be a positive integer"),
		sizeId: z.number().int().positive("Size ID must be a positive integer"),
		description: z.string().optional().nullable(),
		shelterId: z.number().int().positive("Shelter ID must be a positive integer"),
		colorIds: z.array(z.number().int().positive()).min(1, "At least one color is required"),
	}),
});

// Input Validation for 'PATCH pets/:id' endpoint
export const UpdatePetSchema = z.object({
	params: z.object({ id: commonValidations.id }),
	body: z.object({
		name: z.string().min(1).optional(),
		birthdate: z.string().date().optional().nullable(),
		breed: z.string().optional().nullable(),
		speciesId: z.number().int().positive().optional(),
		sexId: z.number().int().positive().optional(),
		statusId: z.number().int().positive().optional(),
		sizeId: z.number().int().positive().optional(),
		description: z.string().optional().nullable(),
		shelterId: z.number().int().positive().optional(),
		colorIds: z.array(z.number().int().positive()).optional(),
	}),
});

// Input Validation for 'DELETE pets/:id' endpoint
export const DeletePetSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST pets/:id/archive' endpoint
export const ArchivePetSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
