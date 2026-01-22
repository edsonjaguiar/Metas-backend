import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { goalCompletions } from "@/database/schema/goals-completions"
import { sql } from "drizzle-orm"

// Função principal que pode ser chamada diretamente
export async function resetWeeklyGoalsLogic() {


	// Calcular início da semana PASSADA
	const now = new Date()

	// Deletar todas as completions anteriores a AGORA
	// O reset roda sábado à meia-noite (início do sábado), zerando a semana para o fim de semana/próxima semana
	await db
		.delete(goalCompletions)
		.where(sql`${goalCompletions.completedAt} < ${now}`)

	return {
		success: true,
		deletedAt: now.toISOString(),
		message: "Weekly goals reset completed successfully",
	}
}

// Task do Trigger.dev usando schedules.task()
export const resetWeeklyGoals = schedules.task({
	id: "reset-weekly-goals",
	// Rodar todo sábado às 00:00 (horário de São Paulo)
	cron: {
		pattern: "0 0 * * 6", // 6 = sábado
		timezone: "America/Sao_Paulo",
	},
	run: async (payload) => {
		console.log("[ResetWeeklyGoals] Iniciando reset semanal...")
		const result = await resetWeeklyGoalsLogic()
		console.log(`[ResetWeeklyGoals] Completado: ${result.message}`)
		return result
	},
})

