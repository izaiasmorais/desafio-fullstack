import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { fastify } from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { deleteWebhook } from "./routes/delete-webhook";
import { getWebhook } from "./routes/get-webhook";
import { listWebhooks } from "./routes/list-webhooks";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
	origin: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	// credentials: true,
});

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "Webhook Inspector API",
			description: "API documentation for the Webhook Inspector service",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
	routePrefix: "/docs",
	configuration: {
		theme: "laserwave",
		darkMode: true,
	},
});

app.register(listWebhooks);
app.register(getWebhook);
app.register(deleteWebhook);

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
	console.log(`HTTP server running at http://localhost:${env.PORT}/`);
	console.log(`Docs available at http://localhost:${env.PORT}/docs`);
});
