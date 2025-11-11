import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateEventSchema,
	DeleteEventSchema,
	EventSchema,
	GetEventSchema,
	GetEventsSchema,
	UpdateEventSchema,
} from "@/api/event/eventModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { eventController } from "./eventController";

export const eventRegistry = new OpenAPIRegistry();
export const eventRouter: Router = express.Router();

eventRegistry.register("Event", EventSchema);

eventRegistry.registerPath({
	method: "get",
	path: "/events",
	tags: ["Event"],
	request: { query: GetEventsSchema.shape.query },
	responses: createApiResponse(z.array(EventSchema), "Success"),
});

eventRouter.get("/", validateRequest(GetEventsSchema), eventController.getEvents);

eventRegistry.registerPath({
	method: "get",
	path: "/events/{id}",
	tags: ["Event"],
	request: { params: GetEventSchema.shape.params },
	responses: createApiResponse(EventSchema, "Success"),
});

eventRouter.get("/:id", validateRequest(GetEventSchema), eventController.getEvent);

eventRegistry.registerPath({
	method: "post",
	path: "/events",
	tags: ["Event"],
	request: { body: { content: { "application/json": { schema: CreateEventSchema.shape.body } } } },
	responses: createApiResponse(EventSchema, "Success"),
});

eventRouter.post("/", validateRequest(CreateEventSchema), eventController.createEvent);

eventRegistry.registerPath({
	method: "patch",
	path: "/events/{id}",
	tags: ["Event"],
	request: {
		params: UpdateEventSchema.shape.params,
		body: { content: { "application/json": { schema: UpdateEventSchema.shape.body } } },
	},
	responses: createApiResponse(EventSchema, "Success"),
});

eventRouter.patch("/:id", validateRequest(UpdateEventSchema), eventController.updateEvent);

eventRegistry.registerPath({
	method: "delete",
	path: "/events/{id}",
	tags: ["Event"],
	request: { params: DeleteEventSchema.shape.params },
	responses: createApiResponse(z.null(), "Success"),
});

eventRouter.delete("/:id", validateRequest(DeleteEventSchema), eventController.deleteEvent);
