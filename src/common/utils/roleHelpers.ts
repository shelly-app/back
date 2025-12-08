/**
 * Role utilities for mapping between role IDs and names
 */

export type RoleName = "admin" | "member" | "adopter";

export const ROLES = {
	ADMIN: { id: 1, name: "admin" as RoleName },
	MEMBER: { id: 2, name: "member" as RoleName },
	ADOPTER: { id: 3, name: "adopter" as RoleName },
} as const;

/**
 * Get role name from role ID
 * @param roleId - The role ID (1, 2, or 3)
 * @returns The role name or "adopter" as default
 */
export const getRoleName = (roleId: number): RoleName => {
	const role = Object.values(ROLES).find((r) => r.id === roleId);
	return role?.name || "adopter";
};

/**
 * Get role ID from role name
 * @param roleName - The role name
 * @returns The role ID
 */
export const getRoleId = (roleName: RoleName): number => {
	const roleKey = roleName.toUpperCase() as keyof typeof ROLES;
	return ROLES[roleKey].id;
};

/**
 * Check if a role is valid
 * @param roleName - The role name to check
 * @returns True if the role is valid
 */
export const isValidRole = (roleName: string): roleName is RoleName => {
	return roleName === "admin" || roleName === "member" || roleName === "adopter";
};
