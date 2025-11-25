import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
	app.all(
		"/capture/*",
		{
			schema: {
				summary: "Capture incoming webhook requests",
				tags: ["External"],

				response: {
					200: z.object({
						id: z.uuidv7(),
					}),
				},
			},
		},
		async (request, reply) => {}
	);
};
