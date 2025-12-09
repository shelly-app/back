import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";

// Create verifier instance (singleton)
// Only create if Cognito credentials are provided
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

if (env.AWS_COGNITO_USER_POOL_ID && env.AWS_COGNITO_CLIENT_ID) {
	verifier = CognitoJwtVerifier.create({
		userPoolId: env.AWS_COGNITO_USER_POOL_ID,
		tokenUse: "id",
		clientId: env.AWS_COGNITO_CLIENT_ID,
	});
}

/**
 * Authentication middleware
 * Verifies Cognito JWT token and syncs user to database
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		// Check if Cognito is configured
		if (!verifier) {
			const response = ServiceResponse.failure(
				"Authentication not configured. Please set AWS_COGNITO_USER_POOL_ID and AWS_COGNITO_CLIENT_ID environment variables.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
			res.status(response.statusCode).send(response);
			return;
		}

		// Extract token from header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			const response = ServiceResponse.failure(
				"Missing or invalid authorization header",
				null,
				StatusCodes.UNAUTHORIZED,
			);
			res.status(response.statusCode).send(response);
			return;
		}

		const token = authHeader.substring(7);

		// Verify token
		const payload = await verifier.verify(token);

		// Sync user to database (create or update)
		const dbUserResult = await userService.syncCognitoUser({
			cognitoSub: payload.sub,
			email: payload.email as string,
			name: (payload.name as string) || (payload.email as string),
		});

		if (!dbUserResult.success || !dbUserResult.responseObject) {
			const response = ServiceResponse.failure(
				"Failed to sync user with database",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
			res.status(response.statusCode).send(response);
			return;
		}

		const dbUser = dbUserResult.responseObject;

		// Attach user to request
		req.user = {
			id: dbUser.id,
			cognitoSub: dbUser.cognitoSub as string,
			email: dbUser.email,
			name: dbUser.name,
		};

		next();
	} catch (_error) {
		const response = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
		res.status(response.statusCode).send(response);
	}
};
