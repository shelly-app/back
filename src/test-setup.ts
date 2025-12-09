import type { NextFunction, Request, Response } from "express";
import { vi } from "vitest";

// Mock the authenticate middleware to bypass authentication in tests
vi.mock("@/common/middleware/authenticate", () => ({
	authenticate: vi.fn((req: Request, _res: Response, next: NextFunction) => {
		// Add a test user to the request
		req.user = {
			id: 1,
			cognitoSub: "test-cognito-sub-123",
			email: "test@example.com",
			name: "Test User",
		};
		next();
	}),
}));

// Mock the authorize middleware to bypass authorization in tests
vi.mock("@/common/middleware/authorize", () => ({
	authorize: vi.fn(() => (req: Request, _res: Response, next: NextFunction) => {
		// Add test shelter context
		req.shelterContext = {
			shelterId: 1,
			roleId: 1,
			roleName: "admin",
		};
		next();
	}),
}));

// Mock the database module to prevent actual database connections in tests
vi.mock("@/database/database", () => {
	const mockUsers = [
		{
			id: 1,
			name: "Test User",
			email: "test@example.com",
			age: 25,
			created_at: new Date(),
			updated_at: new Date(),
		},
	];

	const mockPets = [
		{
			id: 1,
			name: "Max",
			birthdate: "2020-01-15",
			breed: "Golden Retriever",
			species_id: 1,
			sex_id: 1,
			status_id: 1,
			size_id: 2,
			description: "Friendly dog",
			shelter_id: 1,
			created_at: new Date(),
			updated_at: new Date(),
		},
	];

	const mockPetColors = [{ id: 1, color: "golden" }];

	// Helper to create chainable query builder mock
	const createQueryBuilder = (tableName: string) => {
		const currentTable = tableName;

		// biome-ignore lint/suspicious/noExplicitAny: Mock object needs flexible typing for tests
		const builder: any = {
			selectAll: vi.fn(() => builder),
			select: vi.fn(() => builder),
			where: vi.fn(() => builder),
			innerJoin: vi.fn(() => builder),
			returningAll: vi.fn(() => builder),
			executeTakeFirst: vi.fn(() => {
				if (currentTable === "users") {
					return Promise.resolve(null);
				}
				if (currentTable === "pets") {
					return Promise.resolve(null);
				}
				if (currentTable === "pet_pet_colors") {
					return Promise.resolve(mockPetColors);
				}
				return Promise.resolve(null);
			}),
			executeTakeFirstOrThrow: vi.fn(() => {
				if (currentTable === "users") {
					return Promise.resolve(mockUsers[0]);
				}
				if (currentTable === "pets") {
					return Promise.resolve(mockPets[0]);
				}
				return Promise.resolve(null);
			}),
			execute: vi.fn(() => {
				if (currentTable === "users") {
					return Promise.resolve(mockUsers);
				}
				if (currentTable === "pets") {
					return Promise.resolve(mockPets);
				}
				if (currentTable === "pet_pet_colors") {
					return Promise.resolve(mockPetColors);
				}
				return Promise.resolve([]);
			}),
		};

		return builder;
	};

	return {
		db: {
			selectFrom: vi.fn((tableName: string) => createQueryBuilder(tableName)),
			insertInto: vi.fn((tableName: string) => {
				const builder = createQueryBuilder(tableName);
				builder.values = vi.fn(() => builder);
				return builder;
			}),
			updateTable: vi.fn((tableName: string) => {
				const builder = createQueryBuilder(tableName);
				builder.set = vi.fn(() => builder);
				return builder;
			}),
			deleteFrom: vi.fn((tableName: string) => {
				const builder = createQueryBuilder(tableName);
				builder.executeTakeFirst = vi.fn(() => Promise.resolve({ numDeletedRows: 0n }));
				return builder;
			}),
			transaction: vi.fn(() => ({
				// biome-ignore lint/suspicious/noExplicitAny: Transaction callback needs flexible typing
				execute: vi.fn((fn: any) => {
					// Create a mock transaction object with same interface
					const trx = {
						selectFrom: vi.fn((tableName: string) => createQueryBuilder(tableName)),
						insertInto: vi.fn((tableName: string) => {
							const builder = createQueryBuilder(tableName);
							builder.values = vi.fn(() => builder);
							return builder;
						}),
						updateTable: vi.fn((tableName: string) => {
							const builder = createQueryBuilder(tableName);
							builder.set = vi.fn(() => builder);
							return builder;
						}),
						deleteFrom: vi.fn((tableName: string) => createQueryBuilder(tableName)),
					};
					return fn(trx);
				}),
			})),
			destroy: vi.fn().mockResolvedValue(undefined),
		},
		checkDatabaseConnection: vi.fn().mockResolvedValue(true),
		closeDatabaseConnection: vi.fn().mockResolvedValue(undefined),
	};
});
