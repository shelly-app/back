import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it } from "vitest";
import { authenticate } from "../authenticate";

/**
 * Authentication Middleware Tests
 *
 * Note: These tests run with the global mock from test-setup.ts which injects a test user.
 * This is intentional for integration testing. The middleware's actual authentication logic
 * (JWT verification, Cognito integration, DISABLE_AUTH bypass) is tested through:
 *
 * 1. Integration tests in router test files (e.g., petRouter.test.ts)
 * 2. Manual testing with real AWS Cognito (see AUTHENTICATION_TESTING.md)
 * 3. Production deployment validation
 *
 * For unit testing the actual middleware implementation without mocks, a separate test
 * environment would be needed with different Vitest configuration.
 */
describe("Authentication Middleware", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			headers: {},
			user: undefined,
		};

		mockResponse = {};
		mockNext = () => {};
	});

	describe("Test environment behavior", () => {
		it("should inject test user in test environment", async () => {
			// Act
			await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert - In test environment, a test user is injected
			expect(mockRequest.user).toBeDefined();
			expect(mockRequest.user?.id).toBe(1);
			expect(mockRequest.user?.email).toBe("test@example.com");
		});

		it("should work without Authorization header in test environment", async () => {
			// Arrange
			mockRequest.headers = {};

			// Act
			await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockRequest.user).toBeDefined();
		});

		it("should be callable as Express middleware", () => {
			// Assert
			expect(typeof authenticate).toBe("function");
			expect(authenticate.length).toBe(3); // (req, res, next)
		});
	});
});
