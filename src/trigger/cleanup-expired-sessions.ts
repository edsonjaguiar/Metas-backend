import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { sessions } from "@/database/schema/sessions"
import { lte } from "drizzle-orm"

/**
 * Task para limpar sessões expiradas do banco de dados.
 * Roda diariamente para manter a tabela de sessões leve.
 */
export const cleanupExpiredSessions = schedules.task({
	id: "cleanup-expired-sessions",
	// Rodar todos os dias às 03:00 (horário de São Paulo)
	cron: {
		pattern: "0 3 * * *",
		timezone: "America/Sao_Paulo",
	},
	run: async (payload) => {
		console.log("[CleanupSessions] Iniciando limpeza de sessões expiradas...")
		
		const now = new Date()
		
		try {
			const result = await db
				.delete(sessions)
				.where(lte(sessions.expiresAt, now))
				.returning({ id: sessions.id })

			console.log(`[CleanupSessions] Limpeza concluída. ${result.length} sessões removidas.`)
			
			return {
				success: true,
				deletedCount: result.length,
				timestamp: now.toISOString(),
			}
		} catch (error) {
			console.error("[CleanupSessions] Erro ao limpar sessões:", error)
			throw error
		}
	},
})
