import type { Shelter, ShelterMember } from "@/api/shelter/shelterModel";
import { db } from "@/database";

interface ShelterFilters {
	city?: string;
	state?: string;
	country?: string;
	includeDeleted?: boolean;
}

interface CreateShelterData {
	name: string;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	zip?: number | null;
	latitude?: number | null;
	longitude?: number | null;
}

interface UpdateShelterData {
	name?: string;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	zip?: number | null;
	latitude?: number | null;
	longitude?: number | null;
}

export class ShelterRepository {
	async findAllAsync(filters: ShelterFilters = {}): Promise<Shelter[]> {
		let query = db.selectFrom("shelters").selectAll();

		// Apply filters
		if (filters.city) {
			query = query.where("city", "=", filters.city);
		}
		if (filters.state) {
			query = query.where("state", "=", filters.state);
		}
		if (filters.country) {
			query = query.where("country", "=", filters.country);
		}

		// Filter soft deleted unless explicitly included
		if (!filters.includeDeleted) {
			query = query.where("deleted_at", "is", null);
		}

		const shelters = await query.execute();

		return shelters.map((shelter) => ({
			id: shelter.id,
			name: shelter.name,
			address: shelter.address,
			city: shelter.city,
			state: shelter.state,
			country: shelter.country,
			zip: shelter.zip,
			latitude: shelter.latitude,
			longitude: shelter.longitude,
			createdAt: shelter.created_at,
			updatedAt: shelter.updated_at,
			deletedAt: shelter.deleted_at,
		}));
	}

	async findByIdAsync(id: number): Promise<Shelter | null> {
		const shelter = await db
			.selectFrom("shelters")
			.selectAll()
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!shelter) return null;

		return {
			id: shelter.id,
			name: shelter.name,
			address: shelter.address,
			city: shelter.city,
			state: shelter.state,
			country: shelter.country,
			zip: shelter.zip,
			latitude: shelter.latitude,
			longitude: shelter.longitude,
			createdAt: shelter.created_at,
			updatedAt: shelter.updated_at,
			deletedAt: shelter.deleted_at,
		};
	}

	async createAsync(shelterData: CreateShelterData): Promise<Shelter> {
		const newShelter = await db
			.insertInto("shelters")
			.values({
				name: shelterData.name,
				address: shelterData.address ?? null,
				city: shelterData.city ?? null,
				state: shelterData.state ?? null,
				country: shelterData.country ?? null,
				zip: shelterData.zip ?? null,
				latitude: shelterData.latitude ?? null,
				longitude: shelterData.longitude ?? null,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newShelter.id,
			name: newShelter.name,
			address: newShelter.address,
			city: newShelter.city,
			state: newShelter.state,
			country: newShelter.country,
			zip: newShelter.zip,
			latitude: newShelter.latitude,
			longitude: newShelter.longitude,
			createdAt: newShelter.created_at,
			updatedAt: newShelter.updated_at,
			deletedAt: newShelter.deleted_at,
		};
	}

	async updateAsync(id: number, shelterData: UpdateShelterData): Promise<Shelter | null> {
		const updateData: {
			name?: string;
			address?: string | null;
			city?: string | null;
			state?: string | null;
			country?: string | null;
			zip?: number | null;
			latitude?: number | null;
			longitude?: number | null;
		} = {};

		if (shelterData.name !== undefined) updateData.name = shelterData.name;
		if (shelterData.address !== undefined) updateData.address = shelterData.address;
		if (shelterData.city !== undefined) updateData.city = shelterData.city;
		if (shelterData.state !== undefined) updateData.state = shelterData.state;
		if (shelterData.country !== undefined) updateData.country = shelterData.country;
		if (shelterData.zip !== undefined) updateData.zip = shelterData.zip;
		if (shelterData.latitude !== undefined) updateData.latitude = shelterData.latitude;
		if (shelterData.longitude !== undefined) updateData.longitude = shelterData.longitude;

		if (Object.keys(updateData).length === 0) {
			return this.findByIdAsync(id);
		}

		const updatedShelter = await db
			.updateTable("shelters")
			.set(updateData)
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.returningAll()
			.executeTakeFirst();

		if (!updatedShelter) return null;

		return {
			id: updatedShelter.id,
			name: updatedShelter.name,
			address: updatedShelter.address,
			city: updatedShelter.city,
			state: updatedShelter.state,
			country: updatedShelter.country,
			zip: updatedShelter.zip,
			latitude: updatedShelter.latitude,
			longitude: updatedShelter.longitude,
			createdAt: updatedShelter.created_at,
			updatedAt: updatedShelter.updated_at,
			deletedAt: updatedShelter.deleted_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Soft delete
		const result = await db
			.updateTable("shelters")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		return Number(result.numUpdatedRows) > 0;
	}

	async getMembersAsync(shelterId: number): Promise<ShelterMember[]> {
		const members = await db
			.selectFrom("assignments")
			.innerJoin("users", "assignments.user_id", "users.id")
			.innerJoin("roles", "assignments.role_id", "roles.id")
			.select([
				"users.id as userId",
				"users.name as userName",
				"users.email as userEmail",
				"roles.id as roleId",
				"roles.role as roleName",
				"assignments.id as assignmentId",
			])
			.where("assignments.shelter_id", "=", shelterId)
			.execute();

		return members.map((member) => ({
			userId: member.userId,
			userName: member.userName,
			userEmail: member.userEmail,
			roleId: member.roleId,
			roleName: member.roleName,
			assignmentId: member.assignmentId,
		}));
	}
}
