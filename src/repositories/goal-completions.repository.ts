import { and, eq, sql } from "drizzle-orm"
import { db } from "@/database/client"
import { goalCompletions } from "@/database/schema/goals-completions"

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
	 * Buscar completion de hoje
	 */
	async findTodayCompletion(goalId: string, userId: string) {
		const allCompletions = await this.findByGoalAndUser(goalId, userId)

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return allCompletions.find((c) => {
			const completionDate = new Date(c.completedAt)
			completionDate.setHours(0, 0, 0, 0)
			return completionDate.getTime() === today.getTime()
		})
	},

	/**
	 * Buscar completions da semana
	 */
	async findWeekCompletions(
		goalId: string,
		userId: string,
		startOfWeek: Date,
	) {
		const allCompletions = await this.findByGoalAndUser(goalId, userId)

		return allCompletions.filter((c) => {
			const completionDate = new Date(c.completedAt)
			return completionDate >= startOfWeek
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
