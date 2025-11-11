import { StatusCodes } from "http-status-codes";

import type { Event } from "@/api/event/eventModel";
import { EventRepository } from "@/api/event/eventRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

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

export class EventService {
	private eventRepository: EventRepository;

	constructor(repository: EventRepository = new EventRepository()) {
		this.eventRepository = repository;
	}

	async findAll(filters: EventFilters = {}): Promise<ServiceResponse<Event[] | null>> {
		try {
			const events = await this.eventRepository.findAllAsync(filters);
			if (!events || events.length === 0) {
				return ServiceResponse.failure("No Events found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Event[]>("Events found", events);
		} catch (ex) {
			const errorMessage = `Error finding all events: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving events.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: number): Promise<ServiceResponse<Event | null>> {
		try {
			const event = await this.eventRepository.findByIdAsync(id);
			if (!event) {
				return ServiceResponse.failure("Event not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Event>("Event found", event);
		} catch (ex) {
			const errorMessage = `Error finding event with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding event.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async create(data: CreateEventData): Promise<ServiceResponse<Event | null>> {
		try {
			const event = await this.eventRepository.createAsync(data);
			return ServiceResponse.success<Event>("Event created successfully", event, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating event: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating event.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async update(id: number, data: UpdateEventData): Promise<ServiceResponse<Event | null>> {
		try {
			const event = await this.eventRepository.updateAsync(id, data);
			if (!event) {
				return ServiceResponse.failure("Event not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Event>("Event updated successfully", event);
		} catch (ex) {
			const errorMessage = `Error updating event with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating event.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.eventRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Event not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Event deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting event with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting event.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const eventService = new EventService();
