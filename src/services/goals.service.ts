import { calculateXpReward } from "@/lib/calculate-xp"
import { goalsRepository } from "@/repositories/goals.repository"
import { goalCompletionsRepository } from "@/repositories/goal-completions.repository"
import { usersRepository } from "@/repositories/users.repository"
import { gamificationService } from "./gamification.service"
import { achievementsService } from "./achievements.service"
import { cacheService } from "./cache.service"
import type {
	CreateGoalData,
	UpdateGoalData,
	CompleteGoalResult,
	DeleteGoalResult,
} from "@/types"

/**
 * Goals Service - Lógica de negócio para goals
 */
export const goalsService = {
	/**
	 * Criar nova goal
	 */
	async createGoal(userId: string, data: CreateGoalData) {
		const xpReward = calculateXpReward(data.desiredWeeklyFrequency)

		const goal = await goalsRepository.create({
			...data,
			userId,
			xpReward,
		})

		// Invalidar cache de progresso
		await cacheService.invalidateProgressCaches(userId)

		return goal
	},

	/**
	 * Atualizar goal
	 */
	async updateGoal(goalId: string, userId: string, data: UpdateGoalData) {
		// Verificar se a goal existe e pertence ao usuário
		const goal = await goalsRepository.findById(goalId, userId)

		if (!goal) {
			throw new Error("Goal not found")
		}

		// Preparar dados de atualização
		const updateData: any = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.desiredWeeklyFrequency !== undefined) {
			updateData.desiredWeeklyFrequency = data.desiredWeeklyFrequency
			updateData.xpReward = calculateXpReward(data.desiredWeeklyFrequency)
		}
		updateData.updatedAt = new Date()

		// Atualizar goal
		const updated = await goalsRepository.update(goalId, updateData)

		return updated
	},

	/**
	 * Deletar goal e recalcular XP
	 */
	async deleteGoal(goalId: string, userId: string): Promise<DeleteGoalResult> {
		// Verificar se a goal existe e pertence ao usuário
		const goal = await goalsRepository.findById(goalId, userId)

		if (!goal) {
			throw new Error("Goal not found")
		}

		// Buscar todas as completions desta goal
		const allCompletions = await goalCompletionsRepository.findByGoalAndUser(
			goalId,
			userId,
		)

		// Filtrar completions da semana atual
		const now = new Date()
		const dayOfWeek = now.getUTCDay()
		const startOfWeek = new Date(now)
		startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek)
		startOfWeek.setUTCHours(0, 0, 0, 0)

		const completionsThisWeek = allCompletions.filter((c) => {
			const completedAt = new Date(c.completedAt)
			return completedAt >= startOfWeek
		})

		// Calcular XP perdido
		const xpLost = completionsThisWeek.length * goal.xpReward

		// Atualizar XP do usuário se necessário
		if (xpLost > 0) {
			const currentUser = await usersRepository.findById(userId)
			if (!currentUser) throw new Error("User not found")

			const xpResult = gamificationService.removeXp(
				currentUser.experience,
				currentUser.totalExperience,
				currentUser.level,
				currentUser.experienceToNextLevel,
				xpLost,
			)

			await usersRepository.updateGamification(userId, xpResult)
		}

		// Deletar completions e goal
		await goalCompletionsRepository.deleteByGoal(goalId)
		await goalsRepository.delete(goalId)

		// Invalidar caches
		await cacheService.invalidateGoalCaches(userId)

		return {
			message: "Goal deleted successfully",
			xpLost,
			completionsDeleted: completionsThisWeek.length,
		}
	},

	/**
	 * Completar/descompletar goal (toggle)
	 */
	async completeGoal(
		goalId: string,
		userId: string,
	): Promise<CompleteGoalResult> {
		// Calcular início da semana (domingo)
		const now = new Date()
		const dayOfWeek = now.getDay()
		const startOfWeek = new Date(now)
		startOfWeek.setDate(now.getDate() - dayOfWeek)
		startOfWeek.setHours(0, 0, 0, 0)

		// Verificar se a goal existe e pertence ao usuário
		const goal = await goalsRepository.findById(goalId, userId)

		if (!goal) {
			throw new Error("Goal not found")
		}

		// Verificar se já completou hoje
		const existingCompletionToday =
			await goalCompletionsRepository.findTodayCompletion(goalId, userId)

		// Se já completou hoje, remover completion (toggle off)
		if (existingCompletionToday) {
			await goalCompletionsRepository.delete(existingCompletionToday.id)

			// Remover XP
			const currentUser = await usersRepository.findById(userId)
			if (!currentUser) throw new Error("User not found")

			const xpResult = gamificationService.removeXp(
				currentUser.experience,
				currentUser.totalExperience,
				currentUser.level,
				currentUser.experienceToNextLevel,
				goal.xpReward,
			)

			await usersRepository.updateGamification(userId, xpResult)

			// Invalidar caches
			await cacheService.invalidateGoalCaches(userId)

			return { completed: false, xpLost: goal.xpReward }
		}

		// Verificar se já atingiu o limite semanal
		const weekCompletions =
			await goalCompletionsRepository.findWeekCompletions(
				goalId,
				userId,
				startOfWeek,
			)

		if (weekCompletions.length >= goal.desiredWeeklyFrequency) {
			throw new Error(
				"Você já completou esta meta o número máximo de vezes esta semana!",
			)
		}

		// Criar completion
		await goalCompletionsRepository.create(goalId, userId)

		// Buscar dados atuais do usuário
		const currentUser = await usersRepository.findById(userId)
		if (!currentUser) throw new Error("User not found")

		// Calcular streak
		const streakResult = gamificationService.calculateStreak(
			currentUser.lastInteractionDate,
			currentUser.currentStreak,
			currentUser.longestStreak,
		)

		// Calcular XP e level
		const xpResult = gamificationService.addXp(
			currentUser.experience,
			currentUser.totalExperience,
			currentUser.level,
			currentUser.experienceToNextLevel,
			goal.xpReward,
		)

		// Preparar atualização de gamificação
		const gamificationUpdate = gamificationService.prepareGamificationUpdate(
			xpResult,
			streakResult,
		)

		// Atualizar usuário
		await usersRepository.updateGamification(userId, gamificationUpdate)

		// Verificar novas conquistas
		const completionsCount = await goalCompletionsRepository.countByUser(userId)

		const newAchievements = await achievementsService.checkAndUnlock(userId, {
			currentStreak: streakResult.currentStreak,
			experience: xpResult.totalExperience, // Usar XP total!
			level: xpResult.level,
			goalsCompleted: completionsCount,
		})

		// Invalidar caches
		await cacheService.invalidateGoalCaches(userId)

		return {
			completed: true,
			xpGained: goal.xpReward,
			newStreak: streakResult.currentStreak,
			achievementsUnlocked: newAchievements,
		}
	},

	/**
	 * Listar goals do usuário
	 */
	async listGoals(userId: string) {
		// Calcular início da semana
		const now = new Date()
		const dayOfWeek = now.getDay()
		const startOfWeek = new Date(now)
		startOfWeek.setDate(now.getDate() - dayOfWeek)
		startOfWeek.setHours(0, 0, 0, 0)

		return await goalsRepository.findAllByUserWithCompletions(
			userId,
			startOfWeek,
		)
	},
}
