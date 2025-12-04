import { and, eq, gte } from "drizzle-orm"
import { db } from "@/database/client"
import { goals } from "@/database/schema/goals"
import { goalCompletions } from "@/database/schema/goals-completions"
import type { CreateGoalData, UpdateGoalData } from "@/types"

/**
 * Goals Repository - Acesso ao banco de dados para goals
 */
export const goalsRepository = {
	/**
	 * Buscar goal por ID e usuário
	 */
	async findById(goalId: string, userId: string) {
		const [goal] = await db
			.select()
			.from(goals)
			.where(and(eq(goals.id, goalId), eq(goals.userId, userId)))

		return goal || null
	},

	/**
	 * Listar todas as goals de um usuário com completions da semana
	 */
	async findAllByUserWithCompletions(userId: string, startOfWeek: Date) {
		const userGoals = await db
			.select({
				goal: goals,
				completions: goalCompletions,
			})
			.from(goals)
			.leftJoin(
				goalCompletions,
				and(
					eq(goalCompletions.goalId, goals.id),
					eq(goalCompletions.userId, userId),
					gte(goalCompletions.completedAt, startOfWeek),
				),
			)
			.where(eq(goals.userId, userId))

		// Agrupar completions por goal
		const goalsMap = new Map()
		for (const row of userGoals) {
			if (!goalsMap.has(row.goal.id)) {
				goalsMap.set(row.goal.id, {
					...row.goal,
					completions: [],
				})
			}
			if (row.completions) {
				goalsMap.get(row.goal.id).completions.push(row.completions)
			}
		}

		return Array.from(goalsMap.values())
	},

	/**
	 * Criar nova goal
	 */
	async create(data: CreateGoalData & { userId: string; xpReward: number }) {
		const [goal] = await db.insert(goals).values(data).returning()
		return goal
	},

	/**
	 * Atualizar goal
	 */
	async update(
		goalId: string,
		data: UpdateGoalData & { xpReward?: number; updatedAt?: Date },
	) {
		const [updated] = await db
			.update(goals)
			.set(data)
			.where(eq(goals.id, goalId))
			.returning()

		return updated
	},

	/**
	 * Deletar goal
	 */
	async delete(goalId: string) {
		await db.delete(goals).where(eq(goals.id, goalId))
	},
}
