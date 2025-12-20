import { z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.string().url().startsWith("postgresql://").optional().default("postgresql://localhost:5432/placeholder"),
	BREVO_API_KEY: z.string().min(1).optional().default("placeholder"),
	FRONTEND_URL: z.string().url().optional().default("http://localhost:5173"),
	// URL do backend (Render) para keep-alive pingar o próprio servidor
	BACKEND_URL: z.string().url().optional().default("http://localhost:3000"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
})

export const env = envSchema.parse(process.env)

