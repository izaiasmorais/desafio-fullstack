import { defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";

const baseUrl = process.env.API_URL || "http://localhost:3333";

export default defineConfig(() => {
	return {
		root: ".",
		input: {
			path: `${baseUrl}/swagger/json`,
		},
		output: {
			clean: true,
			path: "./src/http/generated",
			extension: {
				".ts": "",
			},
		},
		logLevel: "silent",
		plugins: [
			pluginOas(),
			pluginTs(),
			pluginZod(),
			pluginClient({
				output: {
					path: "./axios",
				},
				importPath: "@/lib/axios",
			}),
			pluginReactQuery(),
		],
	};
});
