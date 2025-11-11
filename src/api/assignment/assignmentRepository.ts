import type { Assignment } from "@/api/assignment/assignmentModel";
import { db } from "@/database";

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

export class AssignmentRepository {
	async findAllAsync(filters: AssignmentFilters = {}): Promise<Assignment[]> {
		let query = db.selectFrom("assignments").selectAll();

		// Apply filters
		if (filters.userId) {
			query = query.where("user_id", "=", filters.userId);
		}
		if (filters.roleId) {
			query = query.where("role_id", "=", filters.roleId);
		}
		if (filters.shelterId) {
			query = query.where("shelter_id", "=", filters.shelterId);
		}

		const assignments = await query.execute();

		return assignments.map((assignment) => ({
			id: assignment.id,
			userId: assignment.user_id,
			roleId: assignment.role_id,
			shelterId: assignment.shelter_id,
		}));
	}

	async findByIdAsync(id: number): Promise<Assignment | null> {
		const assignment = await db.selectFrom("assignments").selectAll().where("id", "=", id).executeTakeFirst();

		if (!assignment) return null;

		return {
			id: assignment.id,
			userId: assignment.user_id,
			roleId: assignment.role_id,
			shelterId: assignment.shelter_id,
		};
	}

	async createAsync(data: CreateAssignmentData): Promise<Assignment> {
		const newAssignment = await db
			.insertInto("assignments")
			.values({
				user_id: data.userId,
				role_id: data.roleId,
				shelter_id: data.shelterId,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			id: newAssignment.id,
			userId: newAssignment.user_id,
			roleId: newAssignment.role_id,
			shelterId: newAssignment.shelter_id,
		};
	}

	async deleteAsync(id: number): Promise<boolean> {
		const result = await db.deleteFrom("assignments").where("id", "=", id).executeTakeFirst();

		return Number(result.numDeletedRows) > 0;
	}
}
