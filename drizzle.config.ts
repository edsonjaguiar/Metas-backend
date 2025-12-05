import type { Config } from "drizzle-kit"
import { env } from "@/env"
import "./compression-polyfill"

export default {
	schema: "./src/database/schema",
	out: "./src/database/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
		ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
	},
	casing: "snake_case",
} satisfies Config
