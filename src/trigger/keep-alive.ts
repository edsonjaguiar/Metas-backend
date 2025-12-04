import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { sql } from "drizzle-orm"

export const keepAlive = schedules.task({
	id: "keep-alive",
	// Rodar a cada 4 minutos para evitar cold start do Neon (que ocorre após 5min)
	cron: {
		pattern: "*/4 * * * *",
		timezone: "America/Sao_Paulo",
	},
	run: async (payload) => {
		try {
			await db.execute(sql`SELECT 1`)

			return { success: true, timestamp: new Date() }
		} catch (error) {
	
			throw error
		}
	},
})
