import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { adoptionRequestRegistry } from "@/api/adoptionRequest/adoptionRequestRouter";
import { assignmentRegistry } from "@/api/assignment/assignmentRouter";
import { eventRegistry } from "@/api/event/eventRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { petRegistry } from "@/api/pet/petRouter";
import { petPhotoRegistry } from "@/api/petPhoto/petPhotoRouter";
import { shelterRegistry } from "@/api/shelter/shelterRouter";
import { shelterAccessRequestRegistry } from "@/api/shelterAccessRequest/shelterAccessRequestRouter";
import { userRegistry } from "@/api/user/userRouter";
import { vaccinationRegistry } from "@/api/vaccination/vaccinationRouter";
import { vaccineRegistry } from "@/api/vaccine/vaccineRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		userRegistry,
		petRegistry,
		shelterRegistry,
		shelterAccessRequestRegistry,
		adoptionRequestRegistry,
		eventRegistry,
		vaccineRegistry,
		vaccinationRegistry,
		petPhotoRegistry,
		assignmentRegistry,
	]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}
