import { schedules } from "@trigger.dev/sdk/v3"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { sql } from "drizzle-orm"
import { sendInactivityEmail } from "@/emails/email-service"
import { env } from "@/env"

// Função principal que pode ser chamada diretamente
export async function checkInactivityLogic() {


	const now = new Date()
	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	yesterday.setHours(0, 0, 0, 0)



	// Buscar usuários que não completaram nenhuma meta ontem (ou antes)
	// Isso inclui quem está no "período de graça" (pulo de 1 dia)
	const inactiveUsers = await db
		.select()
		.from(users)
		.where(
			sql`${users.lastInteractionDate} < ${yesterday}`
		)



	// Enviar email triste para cada usuário
	for (const user of inactiveUsers) {
		if (!user.email) continue

		try {
			await sendInactivityEmail({
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
		usersNotified: inactiveUsers.length,
		message: `Notified ${inactiveUsers.length} inactive users`,
	}
}

// Task do Trigger.dev v4 usando schedules.task()
export const checkInactivity = schedules.task({
	id: "check-inactivity",
	run: async (payload) => {

		return await checkInactivityLogic()
	},
})
