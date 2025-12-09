import { randomUUID } from "node:crypto";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

export class S3Service {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;

	constructor() {
		this.bucketName = env.AWS_S3_BUCKET_NAME;

		// Configure S3 client with LocalStack endpoint for local/test environments
		const clientConfig: any = {
			region: env.AWS_REGION,
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
			},
		};

		// Use LocalStack endpoint if configured (local development/testing)
		if (env.AWS_S3_ENDPOINT) {
			clientConfig.endpoint = env.AWS_S3_ENDPOINT;
			clientConfig.forcePathStyle = true; // Required for LocalStack
		}

		this.s3Client = new S3Client(clientConfig);
	}

	/**
	 * Generate a unique S3 key for a pet photo
	 * Format: pets/{petId}/{timestamp}-{uuid}.{extension}
	 */
	private generatePhotoKey(petId: number, originalName: string): string {
		const timestamp = Date.now();
		const uuid = randomUUID();
		const extension = originalName.split(".").pop() || "jpg";
		return `pets/${petId}/${timestamp}-${uuid}.${extension}`;
	}

	/**
	 * Upload a photo to S3
	 * @param file - File buffer
	 * @param petId - Pet ID for organizing files
	 * @param originalName - Original filename
	 * @param contentType - MIME type
	 * @returns S3 key of uploaded file
	 */
	async uploadPhoto(file: Buffer, petId: number, originalName: string, contentType: string): Promise<string> {
		const key = this.generatePhotoKey(petId, originalName);

		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Body: file,
			ContentType: contentType,
		};

		try {
			await this.s3Client.send(new PutObjectCommand(params));
			logger.info(`Photo uploaded to S3: ${key}`);
			return key;
		} catch (error) {
			logger.error(`Failed to upload photo to S3: ${(error as Error).message}`);
			throw new Error("Failed to upload photo to S3");
		}
	}

	/**
	 * Get a signed URL for downloading a photo
	 * @param key - S3 key of the photo
	 * @param expiresIn - URL expiration time in seconds (default: 900 = 15 minutes)
	 * @returns Signed URL
	 */
	async getPhotoUrl(key: string, expiresIn = 900): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		try {
			const url = await getSignedUrl(this.s3Client, command, { expiresIn });
			return url;
		} catch (error) {
			logger.error(`Failed to generate signed URL for ${key}: ${(error as Error).message}`);
			throw new Error("Failed to generate signed URL");
		}
	}

	/**
	 * Delete a photo from S3
	 * @param key - S3 key of the photo to delete
	 */
	async deletePhoto(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		try {
			await this.s3Client.send(command);
			logger.info(`Photo deleted from S3: ${key}`);
		} catch (error) {
			logger.error(`Failed to delete photo from S3: ${key}: ${(error as Error).message}`);
			throw new Error("Failed to delete photo from S3");
		}
	}

	/**
	 * Check S3 connectivity (for health checks)
	 * @returns true if S3 is accessible
	 */
	async checkHealth(): Promise<boolean> {
		try {
			// Try to list buckets to verify connectivity
			await this.s3Client.send(
				new GetObjectCommand({
					Bucket: this.bucketName,
					Key: "health-check-dummy",
				}),
			);
			return true;
		} catch (error: any) {
			// NoSuchKey error means bucket is accessible (which is good)
			if (error.name === "NoSuchKey") {
				return true;
			}
			logger.error("S3 health check failed", error);
			return false;
		}
	}
}

// Export singleton instance
export const s3Service = new S3Service();
