import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "@/env"
import { schema } from "./schema"

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
	// Close idle connections after 1s to allow Neon to scale to zero faster
	idleTimeoutMillis: 1000, 
})

export const db = drizzle(pool, {
	schema,
	casing: "snake_case",
})
