import { StatusCodes } from "http-status-codes";
import { assignmentService } from "@/api/assignment/assignmentService";
import type { Shelter, ShelterMember } from "@/api/shelter/shelterModel";
import { ShelterRepository } from "@/api/shelter/shelterRepository";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { emailService } from "@/common/services/emailService";
import { getRoleId, type RoleName } from "@/common/utils/roleHelpers";
import { logger } from "@/server";

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

export class ShelterService {
	private shelterRepository: ShelterRepository;

	constructor(repository: ShelterRepository = new ShelterRepository()) {
		this.shelterRepository = repository;
	}

	// Retrieves all shelters from the database with optional filters
	async findAll(filters: ShelterFilters = {}): Promise<ServiceResponse<Shelter[] | null>> {
		try {
			const shelters = await this.shelterRepository.findAllAsync(filters);
			if (!shelters || shelters.length === 0) {
				return ServiceResponse.failure("No Shelters found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter[]>("Shelters found", shelters);
		} catch (ex) {
			const errorMessage = `Error finding all shelters: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving shelters.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single shelter by their ID
	async findById(id: number): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.findByIdAsync(id);
			if (!shelter) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter>("Shelter found", shelter);
		} catch (ex) {
			const errorMessage = `Error finding shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Creates a new shelter
	async create(shelterData: CreateShelterData): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.createAsync(shelterData);
			return ServiceResponse.success<Shelter>("Shelter created successfully", shelter, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating shelter: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Updates a shelter by their ID
	async update(id: number, shelterData: UpdateShelterData): Promise<ServiceResponse<Shelter | null>> {
		try {
			const shelter = await this.shelterRepository.updateAsync(id, shelterData);
			if (!shelter) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Shelter>("Shelter updated successfully", shelter);
		} catch (ex) {
			const errorMessage = `Error updating shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Deletes a shelter by their ID (soft delete)
	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.shelterRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("Shelter deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting shelter with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while deleting shelter.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves all members of a shelter
	async getMembers(shelterId: number): Promise<ServiceResponse<ShelterMember[] | null>> {
		try {
			const members = await this.shelterRepository.getMembersAsync(shelterId);
			return ServiceResponse.success<ShelterMember[]>("Shelter members found", members);
		} catch (ex) {
			const errorMessage = `Error finding members for shelter ${shelterId}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving shelter members.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Invites a new member to a shelter
	async inviteMember(
		shelterId: number,
		email: string,
		roleName: RoleName,
		inviterName: string,
	): Promise<ServiceResponse<ShelterMember | null>> {
		try {
			// First check if shelter exists
			const shelterResult = await this.findById(shelterId);
			if (!shelterResult.success || !shelterResult.data) {
				return ServiceResponse.failure("Shelter not found", null, StatusCodes.NOT_FOUND);
			}
			const shelter = shelterResult.data;

			// Check if user exists by email, or create placeholder
			const userResult = await userService.findByEmail(email);
			let userId: number;

			if (userResult.success && userResult.data) {
				userId = userResult.data.id;
			} else {
				// Create placeholder user
				const createUserResult = await userService.createFromEmail(email);
				if (!createUserResult.success || !createUserResult.data) {
					return ServiceResponse.failure("Failed to create user", null, StatusCodes.INTERNAL_SERVER_ERROR);
				}
				userId = createUserResult.data.id;
			}

			// Check if assignment already exists
			const existingAssignmentResult = await assignmentService.findAll({
				userId,
				shelterId,
			});

			if (existingAssignmentResult.success && existingAssignmentResult.data?.length) {
				return ServiceResponse.failure("User is already a member of this shelter", null, StatusCodes.CONFLICT);
			}

			// Create assignment
			const roleId = getRoleId(roleName);
			const assignmentResult = await assignmentService.create({
				userId,
				roleId,
				shelterId,
			});

			if (!assignmentResult.success || !assignmentResult.data) {
				return ServiceResponse.failure("Failed to create assignment", null, StatusCodes.INTERNAL_SERVER_ERROR);
			}

			// Send invitation email
			try {
				await emailService.sendInvitationEmail({
					toEmail: email,
					shelterName: shelter.name,
					roleName,
					inviterName,
				});
			} catch (emailError) {
				// Log error but don't fail the request
				logger.error(`Failed to send invitation email to ${email}: ${(emailError as Error).message}`);
			}

			// Return the new member details
			const member: ShelterMember = {
				userId,
				userName: userResult.data?.name || email,
				userEmail: email,
				roleId,
				roleName,
				assignmentId: assignmentResult.data.id,
			};

			return ServiceResponse.success<ShelterMember>("Member invited successfully", member, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error inviting member to shelter ${shelterId}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while inviting member.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const shelterService = new ShelterService();
