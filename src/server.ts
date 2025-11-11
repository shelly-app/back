import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { adoptionRequestRouter } from "@/api/adoptionRequest/adoptionRequestRouter";
import { assignmentRouter } from "@/api/assignment/assignmentRouter";
import { eventRouter } from "@/api/event/eventRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { petRouter } from "@/api/pet/petRouter";
import { petPhotoRouter } from "@/api/petPhoto/petPhotoRouter";
import { shelterRouter } from "@/api/shelter/shelterRouter";
import { userRouter } from "@/api/user/userRouter";
import { vaccinationRouter } from "@/api/vaccination/vaccinationRouter";
import { vaccineRouter } from "@/api/vaccine/vaccineRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/pets", petRouter);
app.use("/shelters", shelterRouter);
app.use("/adoption-requests", adoptionRequestRouter);
app.use("/events", eventRouter);
app.use("/vaccines", vaccineRouter);
app.use("/vaccinations", vaccinationRouter);
app.use("/pet-photos", petPhotoRouter);
app.use("/assignments", assignmentRouter);

// Swagger UI
app.use("/api-docs", openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
