import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import multer from "multer";
import { z } from "zod";
import {
	CreatePetPhotoSchema,
	DeletePetPhotoSchema,
	GetPetPhotoSchema,
	GetPetPhotosSchema,
	GetPetPhotoUrlSchema,
	PetPhotoSchema,
} from "@/api/petPhoto/petPhotoModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { validateRequest } from "@/common/utils/httpHandlers";
import { petPhotoController } from "./petPhotoController";

// Configure multer for memory storage
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (_req, file, cb) => {
		// Only allow image files
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"));
		}
	},
});

export const petPhotoRegistry = new OpenAPIRegistry();
export const petPhotoRouter: Router = express.Router();

petPhotoRegistry.register("PetPhoto", PetPhotoSchema);

petPhotoRegistry.registerPath({
	method: "get",
	path: "/pet-photos",
	tags: ["PetPhoto"],
	request: { query: GetPetPhotosSchema.shape.query },
	responses: createApiResponse(z.array(PetPhotoSchema), "Success"),
});

petPhotoRouter.get("/", validateRequest(GetPetPhotosSchema), petPhotoController.getPetPhotos);

petPhotoRegistry.registerPath({
	method: "get",
	path: "/pet-photos/{id}",
	tags: ["PetPhoto"],
	request: { params: GetPetPhotoSchema.shape.params },
	responses: createApiResponse(PetPhotoSchema, "Success"),
});

petPhotoRouter.get("/:id", validateRequest(GetPetPhotoSchema), petPhotoController.getPetPhoto);

petPhotoRegistry.registerPath({
	method: "get",
	path: "/pet-photos/{id}/url",
	tags: ["PetPhoto"],
	request: { params: GetPetPhotoUrlSchema.shape.params },
	responses: createApiResponse(z.string(), "Success"),
});

petPhotoRouter.get("/:id/url", validateRequest(GetPetPhotoUrlSchema), petPhotoController.getPetPhotoUrl);

petPhotoRegistry.registerPath({
	method: "post",
	path: "/pet-photos",
	tags: ["PetPhoto"],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: CreatePetPhotoSchema.shape.body.extend({
						file: z.any().describe("Photo file (image only, max 5MB)"),
					}),
				},
			},
		},
	},
	responses: createApiResponse(PetPhotoSchema, "Success"),
});

petPhotoRouter.post(
	"/",
	authenticate,
	upload.single("file"),
	validateRequest(CreatePetPhotoSchema),
	petPhotoController.createPetPhoto,
);

petPhotoRegistry.registerPath({
	method: "delete",
	path: "/pet-photos/{id}",
	tags: ["PetPhoto"],
	request: { params: DeletePetPhotoSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

petPhotoRouter.delete("/:id", authenticate, validateRequest(DeletePetPhotoSchema), petPhotoController.deletePetPhoto);
