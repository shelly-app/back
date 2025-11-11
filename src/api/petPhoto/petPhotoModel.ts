import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type PetPhoto = z.infer<typeof PetPhotoSchema>;
export const PetPhotoSchema = z.object({
	id: z.number(),
	petId: z.number(),
	key: z.string(),
	createdAt: z.date(),
	deletedAt: z.date().nullable(),
});

// Input Validation for 'GET pet-photos' endpoint
export const GetPetPhotosSchema = z.object({
	query: z.object({
		petId: z.coerce.number().optional(),
		includeDeleted: z.coerce.boolean().optional(),
	}),
});

// Input Validation for 'GET pet-photos/:id' endpoint
export const GetPetPhotoSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST pet-photos' endpoint
export const CreatePetPhotoSchema = z.object({
	body: z.object({
		petId: z.number().int().positive("Pet ID must be a positive integer"),
		key: z.string().min(1, "Key is required"),
	}),
});

// Input Validation for 'DELETE pet-photos/:id' endpoint
export const DeletePetPhotoSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
