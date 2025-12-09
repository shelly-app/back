import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	// Retrieves all users from the database
	async findAll(): Promise<ServiceResponse<User[] | null>> {
		try {
			const users = await this.userRepository.findAllAsync();
			if (!users || users.length === 0) {
				return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User[]>("Users found", users);
		} catch (ex) {
			const errorMessage = `Error finding all users: $${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single user by their ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Creates a new user
	async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.createAsync(userData);
			return ServiceResponse.success<User>("User created successfully", user, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating user: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Deletes a user by their ID
	async delete(id: number): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.userRepository.deleteAsync(id);
			if (!deleted) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<null>("User deleted successfully", null, StatusCodes.OK);
		} catch (ex) {
			const errorMessage = `Error deleting user with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Syncs a Cognito user to the database (creates or updates)
	async syncCognitoUser(cognitoData: {
		cognitoSub: string;
		email: string;
		name: string;
	}): Promise<ServiceResponse<User | null>> {
		try {
			// Try to find user by Cognito sub
			let user = await this.userRepository.findByCognitoSubAsync(cognitoData.cognitoSub);

			if (user) {
				// Update existing user if name or email changed
				if (user.name !== cognitoData.name || user.email !== cognitoData.email) {
					user = await this.userRepository.updateAsync(user.id, {
						name: cognitoData.name,
						email: cognitoData.email,
					});
				}
				return ServiceResponse.success<User>("User synced successfully", user as User);
			}

			// If not found by Cognito sub, try by email (in case user existed before Cognito)
			user = await this.userRepository.findByEmailAsync(cognitoData.email);

			if (user) {
				// Update existing user with Cognito sub
				user = await this.userRepository.updateAsync(user.id, {
					cognitoSub: cognitoData.cognitoSub,
					name: cognitoData.name,
				});
				return ServiceResponse.success<User>("User synced successfully", user as User);
			}

			// Create new user
			user = await this.userRepository.createFromCognitoAsync(cognitoData);
			return ServiceResponse.success<User>("User created successfully", user, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error syncing Cognito user: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while syncing user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Finds a user by email
	async findByEmail(email: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByEmailAsync(email);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const errorMessage = `Error finding user by email ${email}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Creates a placeholder user from email (for invitations)
	async createFromEmail(email: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.createAsync({
				name: email, // Use email as name until they sign in
				email,
				age: 0, // Placeholder age
				cognitoSub: null,
				country: null,
				state: null,
				city: null,
			});
			return ServiceResponse.success<User>("User created successfully", user, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating user from email ${email}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();
