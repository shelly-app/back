import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { assignmentService } from "@/api/assignment/assignmentService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { getRoleName, type RoleName } from "@/common/utils/roleHelpers";

/**
 * Authorization middleware factory
 * Checks if authenticated user has required role for a shelter
 *
 * @param allowedRoles - Array of role names that are allowed to access the endpoint
 * @param shelterIdSource - Where to extract shelter ID from (params, body, or query)
 * @returns Express middleware function
 */
export const authorize = (allowedRoles: RoleName[], shelterIdSource: "params" | "body" | "query" = "params") => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			// Ensure user is authenticated
			if (!req.user) {
				const response = ServiceResponse.failure("Authentication required", null, StatusCodes.UNAUTHORIZED);
				res.status(response.statusCode).send(response);
				return;
			}

			// Extract shelter ID based on source
			let shelterId: number | undefined;
			if (shelterIdSource === "params") {
				shelterId = req.params.shelterId ? Number(req.params.shelterId) : undefined;
			} else if (shelterIdSource === "body") {
				shelterId = req.body.shelterId;
			} else if (shelterIdSource === "query") {
				shelterId = req.query.shelterId ? Number(req.query.shelterId) : undefined;
			}

			if (!shelterId) {
				const response = ServiceResponse.failure("Shelter ID is required", null, StatusCodes.BAD_REQUEST);
				res.status(response.statusCode).send(response);
				return;
			}

			// Check user's assignment for this shelter
			const assignmentResult = await assignmentService.findAll({
				userId: req.user.id,
				shelterId,
			});

			if (
				!assignmentResult.success ||
				!assignmentResult.responseObject ||
				assignmentResult.responseObject.length === 0
			) {
				const response = ServiceResponse.failure("You do not have access to this shelter", null, StatusCodes.FORBIDDEN);
				res.status(response.statusCode).send(response);
				return;
			}

			// Get user's role for this shelter (take first assignment if multiple)
			const assignment = assignmentResult.responseObject[0];
			const roleId = assignment.roleId;
			const roleName = getRoleName(roleId);

			// Check if user's role is in allowed roles
			if (!allowedRoles.includes(roleName)) {
				const response = ServiceResponse.failure(
					`Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`,
					null,
					StatusCodes.FORBIDDEN,
				);
				res.status(response.statusCode).send(response);
				return;
			}

			// Attach shelter context to request
			req.shelterContext = {
				shelterId,
				roleId,
				roleName,
			};

			next();
		} catch (_error) {
			const response = ServiceResponse.failure("Authorization check failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
			res.status(response.statusCode).send(response);
		}
	};
};
