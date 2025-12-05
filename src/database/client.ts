import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "@/env"
import { schema } from "./schema"

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const db = drizzle(pool, {
	schema,
	casing: "snake_case",
})
