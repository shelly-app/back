import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { s3Service } from "@/common/services/s3Service";

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

const HealthCheckResponseSchema = z.object({
	status: z.string(),
	s3: z.boolean(),
});

healthCheckRegistry.registerPath({
	method: "get",
	path: "/health-check",
	tags: ["Health Check"],
	responses: createApiResponse(HealthCheckResponseSchema, "Success"),
});

healthCheckRouter.get("/", async (_req: Request, res: Response) => {
	const s3Healthy = await s3Service.checkHealth();

	const healthStatus = {
		status: s3Healthy ? "healthy" : "degraded",
		s3: s3Healthy,
	};

	const serviceResponse = ServiceResponse.success("Service health check", healthStatus);
	res.status(serviceResponse.statusCode).send(serviceResponse);
});
