// Extend Express Request type to include authenticated user and shelter context

declare global {
	namespace Express {
		interface Request {
			// Authenticated user information (set by authenticate middleware)
			user?: {
				id: number;
				cognitoSub: string;
				email: string;
				name: string;
			};

			// Shelter context (set by authorize middleware)
			shelterContext?: {
				shelterId: number;
				roleId: number;
				roleName: string;
			};
		}
	}
}

export {};
