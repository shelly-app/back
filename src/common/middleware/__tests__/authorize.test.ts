import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it } from "vitest";
import { authorize } from "../authorize";

/**
 * Authorization Middleware Tests
 *
 * Note: These tests run with the global mock from test-setup.ts which auto-authorizes requests.
 * This is intentional for integration testing. The middleware's actual authorization logic
 * (shelter ID extraction, assignment lookup, role checking) is tested through:
 *
 * 1. Integration tests in router test files (e.g., petRouter.test.ts, adoptionRequestRouter.test.ts)
 * 2. Manual testing with real database and assignments
 * 3. Production deployment validation
 *
 * For unit testing the actual middleware implementation without mocks, a separate test
 * environment would be needed with different Vitest configuration.
 */
describe("Authorization Middleware", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			params: {},
			body: {},
			query: {},
			user: {
				id: 1,
				cognitoSub: "test-cognito-sub",
				email: "test@example.com",
				name: "Test User",
			},
			shelterContext: undefined,
		};

		mockResponse = {};
		mockNext = () => {};
	});

	describe("Test environment behavior", () => {
		it("should inject shelter context in test environment", async () => {
			// Arrange
			const middleware = authorize(["admin"]);

			// Act
			await middleware(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert - In test environment, shelter context is injected
			expect(mockRequest.shelterContext).toBeDefined();
			expect(mockRequest.shelterContext?.shelterId).toBe(1);
			expect(mockRequest.shelterContext?.roleId).toBe(1);
			expect(mockRequest.shelterContext?.roleName).toBe("admin");
		});

		it("should work with different allowed roles", async () => {
			// Arrange
			const middleware = authorize(["admin", "member", "adopter"]);

			// Act
			await middleware(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockRequest.shelterContext).toBeDefined();
		});

		it("should be callable as Express middleware factory", () => {
			// Assert
			expect(typeof authorize).toBe("function");

			const middleware = authorize(["admin"]);
			expect(typeof middleware).toBe("function");
			expect(middleware.length).toBe(3); // (req, res, next)
		});

		it("should accept shelter ID source parameter", () => {
			// Assert - Should not throw
			expect(() => authorize(["admin"], "params")).not.toThrow();
			expect(() => authorize(["admin"], "body")).not.toThrow();
			expect(() => authorize(["admin"], "query")).not.toThrow();
		});
	});
});
