import type { User } from "@/api/user/userModel";
import { db } from "@/database";

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		const users = await db.selectFrom("users").selectAll().execute();

		return users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			age: user.age,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
		}));
	}

	async findByIdAsync(id: number): Promise<User | null> {
		const user = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();

		if (!user) return null;

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			age: user.age,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
		};
	}

	async createAsync(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
		const user = await db
			.insertInto("users")
			.values({
				name: userData.name,
				email: userData.email,
				age: userData.age,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			age: user.age,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
		};
	}

	async updateAsync(id: number, userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null> {
		const user = await db
			.updateTable("users")
			.set({
				...(userData.name && { name: userData.name }),
				...(userData.email && { email: userData.email }),
				...(userData.age !== undefined && { age: userData.age }),
			})
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();

		if (!user) return null;

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			age: user.age,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		const result = await db.deleteFrom("users").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}
}
