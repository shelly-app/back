import { sql } from "kysely";
import type { AdoptionRequest } from "@/api/adoptionRequest/adoptionRequestModel";
import { db } from "@/database";

interface AdoptionRequestFilters {
	petId?: number;
	userId?: number;
	statusId?: number;
}

interface CreateAdoptionRequestData {
	petId: number;
	userId: number;
	statusId: number;
	answers: Record<string, unknown>;
}

interface UpdateAdoptionRequestData {
	statusId?: number;
	answers?: Record<string, unknown>;
}

export class AdoptionRequestRepository {
	async findAllAsync(filters: AdoptionRequestFilters = {}): Promise<AdoptionRequest[]> {
		let query = db.selectFrom("adoption_requests").selectAll();

		// Apply filters
		if (filters.petId) {
			query = query.where("pet_id", "=", filters.petId);
		}
		if (filters.userId) {
			query = query.where("user_id", "=", filters.userId);
		}
		if (filters.statusId) {
			query = query.where("status_id", "=", filters.statusId);
		}

		const adoptionRequests = await query.execute();

		return adoptionRequests.map((request) => ({
			id: request.id,
			petId: request.pet_id,
			userId: request.user_id,
			statusId: request.status_id,
			answers: request.answers as Record<string, unknown>,
			adminMessage: request.admin_message,
			createdAt: request.created_at,
			updatedAt: request.updated_at,
		}));
	}

	async findByIdAsync(id: number): Promise<AdoptionRequest | null> {
		const request = await db.selectFrom("adoption_requests").selectAll().where("id", "=", id).executeTakeFirst();

		if (!request) return null;

		return {
			id: request.id,
			petId: request.pet_id,
			userId: request.user_id,
			statusId: request.status_id,
			answers: request.answers as Record<string, unknown>,
			adminMessage: request.admin_message,
			createdAt: request.created_at,
			updatedAt: request.updated_at,
		};
	}

	async createAsync(data: CreateAdoptionRequestData): Promise<AdoptionRequest> {
		const newRequest = await db
			.insertInto("adoption_requests")
			.values({
				pet_id: data.petId,
				user_id: data.userId,
				status_id: data.statusId,
				answers: sql`${JSON.stringify(data.answers)}::jsonb`,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newRequest.id,
			petId: newRequest.pet_id,
			userId: newRequest.user_id,
			statusId: newRequest.status_id,
			answers: newRequest.answers as Record<string, unknown>,
			adminMessage: newRequest.admin_message,
			createdAt: newRequest.created_at,
			updatedAt: newRequest.updated_at,
		};
	}

	async updateAsync(id: number, data: UpdateAdoptionRequestData): Promise<AdoptionRequest | null> {
		const updateData: {
			status_id?: number;
			answers?: ReturnType<typeof sql<Record<string, unknown>>>;
		} = {};

		if (data.statusId !== undefined) updateData.status_id = data.statusId;
		if (data.answers !== undefined) updateData.answers = sql`${JSON.stringify(data.answers)}::jsonb`;

		if (Object.keys(updateData).length === 0) {
			return this.findByIdAsync(id);
		}

		const updatedRequest = await db
			.updateTable("adoption_requests")
			.set(updateData)
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();

		if (!updatedRequest) return null;

		return {
			id: updatedRequest.id,
			petId: updatedRequest.pet_id,
			userId: updatedRequest.user_id,
			statusId: updatedRequest.status_id,
			answers: updatedRequest.answers as Record<string, unknown>,
			adminMessage: updatedRequest.admin_message,
			createdAt: updatedRequest.created_at,
			updatedAt: updatedRequest.updated_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		const result = await db.deleteFrom("adoption_requests").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}

	async processAsync(id: number, statusId: number, adminMessage?: string): Promise<AdoptionRequest | null> {
		const updatedRequest = await db
			.updateTable("adoption_requests")
			.set({
				status_id: statusId,
				admin_message: adminMessage || null,
			})
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();

		if (!updatedRequest) return null;

		return {
			id: updatedRequest.id,
			petId: updatedRequest.pet_id,
			userId: updatedRequest.user_id,
			statusId: updatedRequest.status_id,
			answers: updatedRequest.answers as Record<string, unknown>,
			adminMessage: updatedRequest.admin_message,
			createdAt: updatedRequest.created_at,
			updatedAt: updatedRequest.updated_at,
		};
	}
}
