import type { PetPhoto } from "@/api/petPhoto/petPhotoModel";
import { db } from "@/database";

interface PetPhotoFilters {
	petId?: number;
	includeDeleted?: boolean;
}

interface CreatePetPhotoData {
	petId: number;
	key: string;
	contentType?: string;
	size?: number;
}

export class PetPhotoRepository {
	async findAllAsync(filters: PetPhotoFilters = {}): Promise<PetPhoto[]> {
		let query = db.selectFrom("pet_photos").selectAll();

		// Apply filters
		if (filters.petId) {
			query = query.where("pet_id", "=", filters.petId);
		}

		// Filter soft deleted unless explicitly included
		if (!filters.includeDeleted) {
			query = query.where("deleted_at", "is", null);
		}

		const petPhotos = await query.execute();

		return petPhotos.map((photo) => ({
			id: photo.id,
			petId: photo.pet_id,
			key: photo.key,
			contentType: photo.content_type,
			size: photo.size,
			createdAt: photo.created_at,
			deletedAt: photo.deleted_at,
		}));
	}

	async findByIdAsync(id: number): Promise<PetPhoto | null> {
		const photo = await db
			.selectFrom("pet_photos")
			.selectAll()
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!photo) return null;

		return {
			id: photo.id,
			petId: photo.pet_id,
			key: photo.key,
			contentType: photo.content_type,
			size: photo.size,
			createdAt: photo.created_at,
			deletedAt: photo.deleted_at,
		};
	}

	async createAsync(data: CreatePetPhotoData): Promise<PetPhoto> {
		const newPhoto = await db
			.insertInto("pet_photos")
			.values({
				pet_id: data.petId,
				key: data.key,
				content_type: data.contentType,
				size: data.size,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newPhoto.id,
			petId: newPhoto.pet_id,
			key: newPhoto.key,
			contentType: newPhoto.content_type,
			size: newPhoto.size,
			createdAt: newPhoto.created_at,
			deletedAt: newPhoto.deleted_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Soft delete
		const result = await db
			.updateTable("pet_photos")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		return Number(result.numUpdatedRows) > 0;
	}
}
