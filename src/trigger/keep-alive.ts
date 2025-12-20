import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { sql } from "drizzle-orm"
import { env } from "@/env"

export const keepAlive = schedules.task({
	id: "keep-alive",
	// Rodar a cada 4 minutos para evitar cold start do Neon (5min) e Render (15min)
	cron: {
		pattern: "*/4 * * * *",
		timezone: "America/Sao_Paulo",
	},
	run: async (payload) => {
		const results = {
			db: false,
			server: false,
			timestamp: new Date(),
		}

		// 1. Ping no banco Neon
		try {
			await db.execute(sql`SELECT 1`)
			results.db = true
			console.log("[KeepAlive] Neon DB ping: OK")
		} catch (error) {
			console.error("[KeepAlive] Neon DB ping failed:", error)
		}

		// 2. Ping HTTP no servidor Render (health endpoint)
		// IMPORTANTE: Usar BACKEND_URL (Render), não FRONTEND_URL (Vercel)
		try {
			const backendUrl = env.BACKEND_URL || "http://localhost:3000"
			console.log(`[KeepAlive] Pinging backend at: ${backendUrl}/health`)
			
			const response = await fetch(`${backendUrl}/health`, {
				method: "GET",
				headers: { "User-Agent": "TriggerDev-KeepAlive" },
			})
			results.server = response.ok
			console.log(`[KeepAlive] Render server ping: ${response.ok ? 'OK' : 'FAILED'}`)
		} catch (error) {
			console.error("[KeepAlive] Render server ping failed:", error)
		}

		return { success: results.db && results.server, ...results }
	},
})

