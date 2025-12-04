import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { goalCompletions } from "@/database/schema/goals-completions"
import { sql } from "drizzle-orm"

// Função principal que pode ser chamada diretamente
export async function resetWeeklyGoalsLogic() {


	// Calcular início da semana PASSADA (domingo passado)
	// O reset roda na segunda 00:00, então deletamos tudo antes do domingo passado
	const now = new Date()
	const dayOfWeek = now.getDay() // 0 = Domingo, 1 = Segunda, ...
	
	// Se hoje é segunda (1), voltar 1 dia para domingo
	// Se hoje é terça (2), voltar 2 dias para domingo, etc.
	const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek
	const lastSunday = new Date(now)
	lastSunday.setDate(now.getDate() - daysToLastSunday)
	lastSunday.setHours(0, 0, 0, 0)



	// Deletar todas as completions anteriores ao domingo passado
	await db
		.delete(goalCompletions)
		.where(sql`${goalCompletions.completedAt} < ${lastSunday}`)



	return {
		success: true,
		deletedAt: lastSunday.toISOString(),
		message: "Weekly goals reset completed successfully",
	}
}

// Task do Trigger.dev v4 usando schedules.task()
export const resetWeeklyGoals = schedules.task({
	id: "reset-weekly-goals",
	run: async (payload) => {

		return await resetWeeklyGoalsLogic()
	},
})
