import { vi } from "vitest";

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

	return {
		db: {
			selectFrom: vi.fn(() => ({
				selectAll: vi.fn(() => ({
					where: vi.fn((field: string, op: string, value: any) => ({
						executeTakeFirst: vi.fn(() => {
							// Return null for non-existent IDs (like MAX_SAFE_INTEGER)
							if (value === Number.MAX_SAFE_INTEGER) {
								return Promise.resolve(null);
							}
							// Return user for existing IDs
							return Promise.resolve(mockUsers.find((u) => u.id === value) || null);
						}),
					})),
					limit: vi.fn(() => ({
						execute: vi.fn(() => Promise.resolve(mockUsers)),
					})),
					execute: vi.fn(() => Promise.resolve(mockUsers)),
				})),
			})),
			insertInto: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returningAll: vi.fn().mockReturnThis(),
			executeTakeFirstOrThrow: vi.fn().mockResolvedValue(mockUsers[0]),
			updateTable: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			deleteFrom: vi.fn().mockReturnThis(),
			destroy: vi.fn().mockResolvedValue(undefined),
		},
		checkDatabaseConnection: vi.fn().mockResolvedValue(true),
		closeDatabaseConnection: vi.fn().mockResolvedValue(undefined),
	};
});
