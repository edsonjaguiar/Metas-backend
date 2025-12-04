import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { sql } from "drizzle-orm"
import { sendStreakExpirationEmail } from "@/emails/email-service"
import { env } from "@/env"

// Função principal que pode ser chamada diretamente
export async function checkStreakExpirationLogic() {


	const now = new Date()
	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	yesterday.setHours(0, 0, 0, 0)

	const yesterdayEnd = new Date(yesterday)
	yesterdayEnd.setHours(23, 59, 59, 999)



	// Buscar usuários cuja última interação foi ontem
	// Esses usuários vão perder o streak se não completarem uma meta hoje
	const usersAtRisk = await db
		.select()
		.from(users)
		.where(
			sql`${users.lastInteractionDate} >= ${yesterday} AND ${users.lastInteractionDate} <= ${yesterdayEnd} AND ${users.currentStreak} > 0`
		)



	// Enviar email para cada usuário
	for (const user of usersAtRisk) {
		if (!user.email) continue

		try {
			await sendStreakExpirationEmail({
				userName: user.name,
				userEmail: user.email,
				currentStreak: user.currentStreak,
				frontendUrl: env.FRONTEND_URL || 'http://localhost:5173',
			})
		} catch (error) {
			console.error(`❌ Erro ao enviar email para ${user.email}:`, error)
		}
	}

	return {
		success: true,
		usersNotified: usersAtRisk.length,
		message: `Notified ${usersAtRisk.length} users about expiring streaks`,
	}
}

// Task do Trigger.dev v4 usando schedules.task()
export const checkStreakExpiration = schedules.task({
	id: "check-streak-expiration",
	run: async (payload) => {

		return await checkStreakExpirationLogic()
	},
})
