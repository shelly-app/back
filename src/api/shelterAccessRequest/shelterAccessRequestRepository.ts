import type { ShelterAccessRequest } from "@/api/shelterAccessRequest/shelterAccessRequestModel";
import { db } from "@/database";

interface ShelterAccessRequestFilters {
	status?: "pending" | "approved" | "rejected";
}

interface CreateShelterAccessRequestData {
	shelterName: string;
	shelterType: string;
	country: string;
	state: string;
	city: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	message: string;
}

interface UpdateShelterAccessRequestData {
	status: "pending" | "approved" | "rejected";
}

export class ShelterAccessRequestRepository {
	async findAllAsync(filters: ShelterAccessRequestFilters = {}): Promise<ShelterAccessRequest[]> {
		let query = db.selectFrom("shelter_access_requests").selectAll();

		// Apply filters
		if (filters.status) {
			query = query.where("status", "=", filters.status);
		}

		const requests = await query.orderBy("created_at", "desc").execute();

		return requests.map((request) => ({
			id: request.id,
			shelterName: request.shelter_name,
			shelterType: request.shelter_type,
			country: request.country,
			state: request.state,
			city: request.city,
			contactName: request.contact_name,
			contactEmail: request.contact_email,
			contactPhone: request.contact_phone,
			message: request.message,
			status: request.status as "pending" | "approved" | "rejected",
			createdAt: request.created_at,
			updatedAt: request.updated_at,
		}));
	}

	async findByIdAsync(id: number): Promise<ShelterAccessRequest | null> {
		const request = await db.selectFrom("shelter_access_requests").selectAll().where("id", "=", id).executeTakeFirst();

		if (!request) return null;

		return {
			id: request.id,
			shelterName: request.shelter_name,
			shelterType: request.shelter_type,
			country: request.country,
			state: request.state,
			city: request.city,
			contactName: request.contact_name,
			contactEmail: request.contact_email,
			contactPhone: request.contact_phone,
			message: request.message,
			status: request.status as "pending" | "approved" | "rejected",
			createdAt: request.created_at,
			updatedAt: request.updated_at,
		};
	}

	async createAsync(requestData: CreateShelterAccessRequestData): Promise<ShelterAccessRequest> {
		const newRequest = await db
			.insertInto("shelter_access_requests")
			.values({
				shelter_name: requestData.shelterName,
				shelter_type: requestData.shelterType,
				country: requestData.country,
				state: requestData.state,
				city: requestData.city,
				contact_name: requestData.contactName,
				contact_email: requestData.contactEmail,
				contact_phone: requestData.contactPhone,
				message: requestData.message,
				status: "pending",
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newRequest.id,
			shelterName: newRequest.shelter_name,
			shelterType: newRequest.shelter_type,
			country: newRequest.country,
			state: newRequest.state,
			city: newRequest.city,
			contactName: newRequest.contact_name,
			contactEmail: newRequest.contact_email,
			contactPhone: newRequest.contact_phone,
			message: newRequest.message,
			status: newRequest.status as "pending" | "approved" | "rejected",
			createdAt: newRequest.created_at,
			updatedAt: newRequest.updated_at,
		};
	}

	async updateAsync(id: number, requestData: UpdateShelterAccessRequestData): Promise<ShelterAccessRequest | null> {
		const updatedRequest = await db
			.updateTable("shelter_access_requests")
			.set({ status: requestData.status })
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();

		if (!updatedRequest) return null;

		return {
			id: updatedRequest.id,
			shelterName: updatedRequest.shelter_name,
			shelterType: updatedRequest.shelter_type,
			country: updatedRequest.country,
			state: updatedRequest.state,
			city: updatedRequest.city,
			contactName: updatedRequest.contact_name,
			contactEmail: updatedRequest.contact_email,
			contactPhone: updatedRequest.contact_phone,
			message: updatedRequest.message,
			status: updatedRequest.status as "pending" | "approved" | "rejected",
			createdAt: updatedRequest.created_at,
			updatedAt: updatedRequest.updated_at,
		};
	}
}
