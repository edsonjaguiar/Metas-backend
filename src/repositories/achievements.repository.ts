import { eq, sql } from "drizzle-orm"
import { db } from "@/database/client"
import {
	userAchievements,
	achievements,
} from "@/database/schema/achievements"

/**
 * Achievements Repository - Acesso ao banco de dados para achievements
 */
export const achievementsRepository = {
	/**
	 * Buscar achievements desbloqueadas por um usuário
	 */
	async findUnlockedByUser(userId: string) {
		return await db
			.select()
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId))
	},

	/**
	 * Desbloquear achievement para um usuário
	 */
	async unlock(userId: string, achievementId: string) {
		const [unlocked] = await db
			.insert(userAchievements)
			.values({
				userId,
				achievementId,
			})
			.returning()

		return unlocked
	},

	/**
	 * Contar achievements por categoria
	 */
	async countByCategory(userId: string) {
		const userAchievementsData = await db
			.select({
				criteriaType: achievements.criteriaType,
			})
			.from(userAchievements)
			.innerJoin(
				achievements,
				eq(userAchievements.achievementId, achievements.id),
			)
			.where(eq(userAchievements.userId, userId))

		const achievementsByCategory = userAchievementsData.reduce(
			(acc, a) => {
				const category = a.criteriaType || "other"
				acc[category] = (acc[category] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		return achievementsByCategory
	},

	/**
	 * Contar total de achievements de um usuário
	 */
	async countByUser(userId: string) {
		const [result] = await db
			.select({ count: sql<number>`count(*)` })
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId))

		return Number(result.count)
	},
}
