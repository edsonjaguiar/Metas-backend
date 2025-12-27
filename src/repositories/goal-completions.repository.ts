import { and, eq, sql } from "drizzle-orm"
import { db } from "@/database/client"
import { goalCompletions } from "@/database/schema/goals-completions"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

// Configurar dayjs com timezone
dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE = "America/Sao_Paulo"

/**
 * Goal Completions Repository - Acesso ao banco de dados para completions
 */
export const goalCompletionsRepository = {
	/**
	 * Buscar todas as completions de uma goal para um usuário
	 */
	async findByGoalAndUser(goalId: string, userId: string) {
		return await db
			.select()
			.from(goalCompletions)
			.where(
				and(eq(goalCompletions.goalId, goalId), eq(goalCompletions.userId, userId)),
			)
	},

	/**
	 * Buscar completion de hoje (usando timezone do Brasil)
	 */
	async findTodayCompletion(goalId: string, userId: string) {
		const allCompletions = await this.findByGoalAndUser(goalId, userId)

		// Usar timezone do Brasil para definir "hoje"
		const todayStr = dayjs().tz(TIMEZONE).format("YYYY-MM-DD")

		return allCompletions.find((c) => {
			const completionDateStr = dayjs(c.completedAt).tz(TIMEZONE).format("YYYY-MM-DD")
			return completionDateStr === todayStr
		})
	},

	/**
	 * Buscar completions da semana (usando timezone do Brasil)
	 */
	async findWeekCompletions(
		goalId: string,
		userId: string,
		startOfWeek: Date,
	) {
		const allCompletions = await this.findByGoalAndUser(goalId, userId)

		// Converter startOfWeek para string no timezone do Brasil para comparação consistente
		const startOfWeekStr = dayjs(startOfWeek).tz(TIMEZONE).format("YYYY-MM-DD")

		return allCompletions.filter((c) => {
			const completionDateStr = dayjs(c.completedAt).tz(TIMEZONE).format("YYYY-MM-DD")
			return completionDateStr >= startOfWeekStr
		})
	},

	/**
	 * Criar completion
	 */
	async create(goalId: string, userId: string) {
		const [completion] = await db
			.insert(goalCompletions)
			.values({
				goalId,
				userId,
			})
			.returning()

		return completion
	},

	/**
	 * Deletar completion
	 */
	async delete(completionId: string) {
		await db.delete(goalCompletions).where(eq(goalCompletions.id, completionId))
	},

	/**
	 * Deletar todas as completions de uma goal
	 */
	async deleteByGoal(goalId: string) {
		await db.delete(goalCompletions).where(eq(goalCompletions.goalId, goalId))
	},

	/**
	 * Contar total de completions de um usuário
	 */
	async countByUser(userId: string) {
		const [result] = await db
			.select({ count: sql<number>`count(*)` })
			.from(goalCompletions)
			.where(eq(goalCompletions.userId, userId))

		return Number(result.count)
	},
}
