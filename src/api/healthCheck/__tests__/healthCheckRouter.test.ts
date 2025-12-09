import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeAll, vi } from "vitest";

import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

// Mock S3 service for health check test
vi.mock("@/common/services/s3Service", () => ({
	s3Service: {
		checkHealth: vi.fn(() => Promise.resolve(true)),
	},
}));

describe("Health Check API endpoints", () => {
	it("GET / - success", async () => {
		const response = await request(app).get("/health-check");
		const result: ServiceResponse = response.body;

		expect(response.statusCode).toEqual(StatusCodes.OK);
		expect(result.success).toBeTruthy();
		expect(result.responseObject).toEqual({ status: "healthy", s3: true });
		expect(result.message).toEqual("Service health check");
	});
});
