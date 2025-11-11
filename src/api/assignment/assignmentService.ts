import { StatusCodes } from "http-status-codes";

import type { Assignment } from "@/api/assignment/assignmentModel";
import { AssignmentRepository } from "@/api/assignment/assignmentRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

interface AssignmentFilters {
	userId?: number;
	roleId?: number;
	shelterId?: number;
}

interface CreateAssignmentData {
	userId: number;
	roleId: number;
	shelterId: number;
}

export class AssignmentService {
	private assignmentRepository: AssignmentRepository;

	constructor(repository: AssignmentRepository = new AssignmentRepository()) {
		this.assignmentRepository = repository;
	}

	async findAll(filters: AssignmentFilters = {}): Promise<ServiceResponse<Assignment[] | null>> {
		try {
			const assignments = await this.assignmentRepository.findAllAsync(filters);
			if (!assignments || assignments.length === 0) {
				return ServiceResponse.failure("No Assignments found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Assignment[]>("Assignments found", assignments);
		} catch (ex) {
			const errorMessage = `Error finding all assignments: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving assignments.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: number): Promise<ServiceResponse<Assignment | null>> {
		try {
			const assignment = await this.assignmentRepository.findByIdAsync(id);
			if (!assignment) {
				return ServiceResponse.failure("Assignment not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Assignment>("Assignment found", assignment);
		} catch (ex) {
			const errorMessage = `Error finding assignment with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding assignment.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreateAssignmentData): Promise<ServiceResponse<Assignment | null>> {
		try {
			const assignment = await this.assignmentRepository.createAsync(data);
			return ServiceResponse.success<Assignment>("Assignment created successfully", assignment, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating assignment: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating assignment.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.assignmentRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Assignment not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Assignment deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting assignment with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting assignment.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const assignmentService = new AssignmentService();
