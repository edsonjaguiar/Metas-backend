import { calculateXpForNextLevel } from "@/lib/calculate-xp"
import type {
	GamificationUpdate,
	StreakCalculationResult,
	XpCalculationResult,
} from "@/types"

/**
 * Gamification Service - Centraliza toda lógica de XP, Level e Streak
 */
export const gamificationService = {
	/**
	 * Calcular novo streak baseado na última interação
	 */
	calculateStreak(
		lastInteractionDate: Date | null,
		currentStreak: number,
		longestStreak: number,
	): StreakCalculationResult {
		const now = new Date()
		const today = new Date(now)
		today.setHours(0, 0, 0, 0)

		// Se não tem interação anterior, começa streak
		if (!lastInteractionDate) {
			return {
				currentStreak: 1,
				longestStreak: Math.max(1, longestStreak),
				shouldUpdate: true,
			}
		}

		const yesterday = new Date(now)
		yesterday.setDate(yesterday.getDate() - 1)
		yesterday.setHours(0, 0, 0, 0)

		const dayBeforeYesterday = new Date(now)
		dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
		dayBeforeYesterday.setHours(0, 0, 0, 0)

		const lastInteraction = new Date(lastInteractionDate)
		lastInteraction.setHours(0, 0, 0, 0)

		// Se já interagiu hoje, não muda o streak
		if (lastInteraction.getTime() === today.getTime()) {
			return {
				currentStreak,
				longestStreak,
				shouldUpdate: false,
			}
		}

		// Se a última interação foi ONTEM, incrementa
		if (lastInteraction.getTime() === yesterday.getTime()) {
			const newStreak = currentStreak + 1
			return {
				currentStreak: newStreak,
				longestStreak: Math.max(newStreak, longestStreak),
				shouldUpdate: true,
			}
		}

		// Se foi ANTEONTEM, mantém (permite 1 dia de folga)
		if (lastInteraction.getTime() === dayBeforeYesterday.getTime()) {
			return {
				currentStreak,
				longestStreak,
				shouldUpdate: true, // Atualiza lastInteractionDate
			}
		}

		// Se foi antes de anteontem, reseta
		return {
			currentStreak: 1,
			longestStreak,
			shouldUpdate: true,
		}
	},

	/**
	 * Adicionar XP e calcular level up
	 */
	addXp(
		currentExperience: number,
		currentTotalExperience: number,
		currentLevel: number,
		currentExperienceToNextLevel: number,
		xpAmount: number,
	): XpCalculationResult {
		let newExperience = currentExperience + xpAmount
		const newTotalExperience = currentTotalExperience + xpAmount
		let newLevel = currentLevel
		let experienceToNextLevel = currentExperienceToNextLevel

		// Sistema de level up com reset de XP
		while (newExperience >= experienceToNextLevel) {
			// Subtrair o XP necessário para o level atual
			newExperience -= experienceToNextLevel
			// Subir de nível
			newLevel += 1
			// Calcular XP necessário para o próximo nível
			experienceToNextLevel = calculateXpForNextLevel(newLevel)
		}

		return {
			experience: newExperience,
			totalExperience: newTotalExperience,
			level: newLevel,
			experienceToNextLevel,
		}
	},

	/**
	 * Remover XP e calcular level down
	 */
	removeXp(
		currentExperience: number,
		currentTotalExperience: number,
		currentLevel: number,
		currentExperienceToNextLevel: number,
		xpAmount: number,
	): XpCalculationResult {
		let newExperience = currentExperience - xpAmount
		const newTotalExperience = Math.max(0, currentTotalExperience - xpAmount)
		let newLevel = currentLevel
		let experienceToNextLevel = currentExperienceToNextLevel

		// Se o XP ficou negativo, precisa descer de nível
		while (newExperience < 0 && newLevel > 1) {
			// Desce um nível
			newLevel -= 1
			// Pega quanto XP era necessário para passar desse nível anterior
			const previousLevelMaxXp = calculateXpForNextLevel(newLevel)
			// Adiciona esse máximo ao XP negativo (ex: -10 + 100 = 90)
			newExperience += previousLevelMaxXp
			// Atualiza o XP necessário para o próximo nível
			experienceToNextLevel = previousLevelMaxXp
		}

		// Proteção para não ficar negativo no nível 1
		if (newExperience < 0) {
			newExperience = 0
		}

		return {
			experience: newExperience,
			totalExperience: newTotalExperience,
			level: newLevel,
			experienceToNextLevel,
		}
	},

	/**
	 * Preparar dados de atualização de gamificação
	 */
	prepareGamificationUpdate(
		xpResult: XpCalculationResult,
		streakResult?: StreakCalculationResult,
	): GamificationUpdate {
		const update: GamificationUpdate = {
			experience: xpResult.experience,
			totalExperience: xpResult.totalExperience,
			level: xpResult.level,
			experienceToNextLevel: xpResult.experienceToNextLevel,
		}

		if (streakResult?.shouldUpdate) {
			update.currentStreak = streakResult.currentStreak
			update.longestStreak = streakResult.longestStreak
			update.lastInteractionDate = new Date()
		}

		return update
	},
}
