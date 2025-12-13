import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { Pet } from "@/api/pet/petModel";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Pet API Endpoints", () => {
	describe("GET /pets", () => {
		it("should return a list of pets", async () => {
			// Act
			const response = await request(app).get("/pets");
			const responseBody: ServiceResponse<Pet[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("Pets found");
			expect(Array.isArray(responseBody.data)).toBeTruthy();
		});

		it("should filter pets by species", async () => {
			// Act
			const response = await request(app).get("/pets?speciesId=1");
			const responseBody: ServiceResponse<Pet[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
		});

		it("should filter pets by shelter", async () => {
			// Act
			const response = await request(app).get("/pets?shelterId=1");
			const responseBody: ServiceResponse<Pet[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
		});
	});

	describe("GET /pets/:id", () => {
		it("should return a not found error for non-existent ID", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;

			// Act
			const response = await request(app).get(`/pets/${testId}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Pet not found");
			expect(responseBody.data).toBeNull();
		});

		it("should return a bad request for invalid ID format", async () => {
			// Act
			const invalidInput = "abc";
			const response = await request(app).get(`/pets/${invalidInput}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
			expect(responseBody.data).toBeNull();
		});
	});

	describe("POST /pets", () => {
		it("should return bad request when required fields are missing", async () => {
			// Arrange
			const invalidPet = {
				name: "Max",
				// missing required fields
			};

			// Act
			const response = await request(app).post("/pets").send(invalidPet);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
		});

		it("should return bad request when colorIds is empty", async () => {
			// Arrange
			const invalidPet = {
				name: "Max",
				speciesId: 1,
				sexId: 1,
				statusId: 1,
				sizeId: 1,
				shelterId: 1,
				colorIds: [], // Empty array should fail
			};

			// Act
			const response = await request(app).post("/pets").send(invalidPet);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
		});
	});

	describe("PATCH /pets/:id", () => {
		it("should return not found for non-existent pet", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;
			const updateData = {
				name: "Updated Name",
			};

			// Act
			const response = await request(app).patch(`/pets/${testId}`).send(updateData);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Pet not found");
		});

		it("should return bad request for invalid ID format", async () => {
			// Act
			const invalidInput = "abc";
			const response = await request(app).patch(`/pets/${invalidInput}`).send({ name: "Test" });
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
		});
	});

	describe("DELETE /pets/:id", () => {
		it("should return not found for non-existent pet", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;

			// Act
			const response = await request(app).delete(`/pets/${testId}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Pet not found");
		});

		it("should return bad request for invalid ID format", async () => {
			// Act
			const invalidInput = "abc";
			const response = await request(app).delete(`/pets/${invalidInput}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
		});
	});
});
