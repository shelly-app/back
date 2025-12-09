import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { S3Service } from "../s3Service";

// Mock AWS SDK
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");

describe("S3Service", () => {
	let s3Service: S3Service;
	let mockS3Client: any;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Mock S3Client
		mockS3Client = {
			send: vi.fn(),
		};
		(S3Client as any).mockImplementation(() => mockS3Client);

		// Create service instance
		s3Service = new S3Service();
	});

	describe("uploadPhoto", () => {
		it("should upload photo to S3 successfully", async () => {
			// Arrange
			const file = Buffer.from("fake-image-data");
			const petId = 1;
			const originalName = "photo.jpg";
			const contentType = "image/jpeg";

			mockS3Client.send.mockResolvedValue({});

			// Act
			const key = await s3Service.uploadPhoto(file, petId, originalName, contentType);

			// Assert
			expect(key).toMatch(/^pets\/1\/\d+-[a-f0-9-]+\.jpg$/);
			expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
		});

		it("should throw error when upload fails", async () => {
			// Arrange
			const file = Buffer.from("fake-image-data");
			const petId = 1;
			const originalName = "photo.jpg";
			const contentType = "image/jpeg";

			mockS3Client.send.mockRejectedValue(new Error("S3 error"));

			// Act & Assert
			await expect(s3Service.uploadPhoto(file, petId, originalName, contentType)).rejects.toThrow(
				"Failed to upload photo to S3",
			);
		});

		it("should generate key with correct format", async () => {
			// Arrange
			const file = Buffer.from("fake-image-data");
			const petId = 123;
			const originalName = "my-dog.png";
			const contentType = "image/png";

			mockS3Client.send.mockResolvedValue({});

			// Act
			const key = await s3Service.uploadPhoto(file, petId, originalName, contentType);

			// Assert
			expect(key).toMatch(/^pets\/123\/\d+-[a-f0-9-]+\.png$/);
			expect(key).toContain("pets/123/");
			expect(key).toMatch(/\.png$/);
		});
	});

	describe("getPhotoUrl", () => {
		it("should generate signed URL successfully", async () => {
			// Arrange
			const key = "pets/1/12345-uuid.jpg";
			const expectedUrl = "https://s3.amazonaws.com/signed-url";

			(getSignedUrl as any).mockResolvedValue(expectedUrl);

			// Act
			const url = await s3Service.getPhotoUrl(key);

			// Assert
			expect(url).toBe(expectedUrl);
			expect(getSignedUrl).toHaveBeenCalledWith(
				mockS3Client,
				expect.any(GetObjectCommand),
				{ expiresIn: 900 }, // Default 15 minutes
			);
		});

		it("should use custom expiration time", async () => {
			// Arrange
			const key = "pets/1/12345-uuid.jpg";
			const customExpiration = 3600; // 1 hour
			const expectedUrl = "https://s3.amazonaws.com/signed-url";

			(getSignedUrl as any).mockResolvedValue(expectedUrl);

			// Act
			await s3Service.getPhotoUrl(key, customExpiration);

			// Assert
			expect(getSignedUrl).toHaveBeenCalledWith(mockS3Client, expect.any(GetObjectCommand), { expiresIn: 3600 });
		});

		it("should throw error when URL generation fails", async () => {
			// Arrange
			const key = "pets/1/12345-uuid.jpg";

			(getSignedUrl as any).mockRejectedValue(new Error("Signing error"));

			// Act & Assert
			await expect(s3Service.getPhotoUrl(key)).rejects.toThrow("Failed to generate signed URL");
		});
	});

	describe("deletePhoto", () => {
		it("should delete photo from S3 successfully", async () => {
			// Arrange
			const key = "pets/1/12345-uuid.jpg";

			mockS3Client.send.mockResolvedValue({});

			// Act
			await s3Service.deletePhoto(key);

			// Assert
			expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
		});

		it("should throw error when deletion fails", async () => {
			// Arrange
			const key = "pets/1/12345-uuid.jpg";

			mockS3Client.send.mockRejectedValue(new Error("S3 error"));

			// Act & Assert
			await expect(s3Service.deletePhoto(key)).rejects.toThrow("Failed to delete photo from S3");
		});
	});

	describe("checkHealth", () => {
		it("should return true when NoSuchKey error occurs (bucket accessible)", async () => {
			// Arrange
			const error: any = new Error("NoSuchKey");
			error.name = "NoSuchKey";
			mockS3Client.send.mockRejectedValue(error);

			// Act
			const result = await s3Service.checkHealth();

			// Assert
			expect(result).toBe(true);
		});

		it("should return false when other errors occur", async () => {
			// Arrange
			mockS3Client.send.mockRejectedValue(new Error("Network error"));

			// Act
			const result = await s3Service.checkHealth();

			// Assert
			expect(result).toBe(false);
		});
	});
});
