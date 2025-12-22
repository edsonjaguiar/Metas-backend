import { ACHIEVEMENTS, checkNewAchievements } from "@/lib/achievements"
import { achievementsRepository } from "@/repositories/achievements.repository"
import { cacheService } from "./cache.service"
import type { UserStats } from "@/types"
import type { Achievement } from "@/lib/achievements"

/**
 * Achievements Service - Lógica de negócio para achievements
 */
export const achievementsService = {
	/**
	 * Listar todas as achievements do usuário (locked + unlocked)
	 */
	async listUserAchievements(userId: string) {
		// Tentar buscar do cache
		return await cacheService.getCached(
			`achievements:v4:${userId}`,
			600, // 10 minutos
			async () => {
				// Buscar achievements desbloqueadas
				const unlocked = await achievementsRepository.findUnlockedByUser(userId)

				// Mapear com dados completos
				const unlockedWithData = unlocked.map((ua) => {
					const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievementId)
					return {
						...achievement,
						unlockedAt: ua.unlockedAt,
					}
				})

				// Retornar todas as achievements (desbloqueadas e bloqueadas)
				const all = ACHIEVEMENTS.map((achievement) => {
					const isUnlocked = unlocked.some(
						(ua) => ua.achievementId === achievement.id,
					)
					const unlockedData = unlockedWithData.find(
						(ua) => ua.id === achievement.id,
					)

					return {
						...achievement,
						unlocked: isUnlocked,
						unlockedAt: unlockedData?.unlockedAt || null,
					}
				})

				return all
			},
		)
	},

	/**
	 * Verificar e desbloquear novas achievements
	 */
	async checkAndUnlock(
		userId: string,
		userStats: UserStats,
	): Promise<Achievement[]> {
		// Buscar achievements já desbloqueadas
		const existingAchievements =
			await achievementsRepository.findUnlockedByUser(userId)
		const unlockedIds = existingAchievements.map((a) => a.achievementId)

		// Verificar novas conquistas
		const newAchievements = checkNewAchievements(userStats, unlockedIds)

		// Desbloquear novas conquistas
		for (const achievement of newAchievements) {
			await achievementsRepository.unlock(userId, achievement.id)
		}

		// Invalidar cache se houver novas achievements
		if (newAchievements.length > 0) {
			await cacheService.invalidateUserCaches(userId)
		}

		return newAchievements
	},
}
