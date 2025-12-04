import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
	project: "proj_eqwpgslidvqkwprwsqzx",
	runtime: "node",
	build: {
		external: [],
	},
	// Duração máxima de execução das tasks (em segundos)
	maxDuration: 300, // 5 minutos
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
})
