import type { Event } from "@/api/event/eventModel";
import { db } from "@/database";

interface EventFilters {
	petId?: number;
	includeDeleted?: boolean;
}

interface CreateEventData {
	petId: number;
	name: string;
	description?: string | null;
	dateTime: string;
}

interface UpdateEventData {
	name?: string;
	description?: string | null;
	dateTime?: string;
}

export class EventRepository {
	async findAllAsync(filters: EventFilters = {}): Promise<Event[]> {
		let query = db.selectFrom("events").selectAll();

		// Apply filters
		if (filters.petId) {
			query = query.where("pet_id", "=", filters.petId);
		}

		// Filter soft deleted unless explicitly included
		if (!filters.includeDeleted) {
			query = query.where("deleted_at", "is", null);
		}

		const events = await query.execute();

		return events.map((event) => ({
			id: event.id,
			petId: event.pet_id,
			name: event.name,
			description: event.description,
			dateTime: event.date_time,
			createdAt: event.created_at,
			updatedAt: event.updated_at,
			deletedAt: event.deleted_at,
		}));
	}

	async findByIdAsync(id: number): Promise<Event | null> {
		const event = await db
			.selectFrom("events")
			.selectAll()
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!event) return null;

		return {
			id: event.id,
			petId: event.pet_id,
			name: event.name,
			description: event.description,
			dateTime: event.date_time,
			createdAt: event.created_at,
			updatedAt: event.updated_at,
			deletedAt: event.deleted_at,
		};
	}

	async createAsync(data: CreateEventData): Promise<Event> {
		const newEvent = await db
			.insertInto("events")
			.values({
				pet_id: data.petId,
				name: data.name,
				description: data.description ?? null,
				date_time: data.dateTime,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newEvent.id,
			petId: newEvent.pet_id,
			name: newEvent.name,
			description: newEvent.description,
			dateTime: newEvent.date_time,
			createdAt: newEvent.created_at,
			updatedAt: newEvent.updated_at,
			deletedAt: newEvent.deleted_at,
		};
	}

	async updateAsync(id: number, data: UpdateEventData): Promise<Event | null> {
		const updateData: {
			name?: string;
			description?: string | null;
			date_time?: string;
		} = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.dateTime !== undefined) updateData.date_time = data.dateTime;

		if (Object.keys(updateData).length === 0) {
			return this.findByIdAsync(id);
		}

		const updatedEvent = await db
			.updateTable("events")
			.set(updateData)
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.returningAll()
			.executeTakeFirst();

		if (!updatedEvent) return null;

		return {
			id: updatedEvent.id,
			petId: updatedEvent.pet_id,
			name: updatedEvent.name,
			description: updatedEvent.description,
			dateTime: updatedEvent.date_time,
			createdAt: updatedEvent.created_at,
			updatedAt: updatedEvent.updated_at,
			deletedAt: updatedEvent.deleted_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		// Soft delete
		const result = await db
			.updateTable("events")
			.set({ deleted_at: new Date() })
			.where("id", "=", id)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		return Number(result.numUpdatedRows) > 0;
	}
}
