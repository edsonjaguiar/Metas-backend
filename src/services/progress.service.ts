import { usersRepository } from "@/repositories/users.repository"
import { goalCompletionsRepository } from "@/repositories/goal-completions.repository"
import { achievementsRepository } from "@/repositories/achievements.repository"
import { cacheService } from "./cache.service"
import { eq, and, gte, sql } from "drizzle-orm"
import { db } from "@/database/client"
import { goalCompletions } from "@/database/schema/goals-completions"
import { goals } from "@/database/schema/goals"

type Period = "7d" | "30d" | "90d" | "all"

/**
 * Progress Service - Lógica de negócio para dados de progresso
 */
export const progressService = {
	/**
	 * Buscar dados de progresso do usuário
	 */
	async getProgress(userId: string, period: Period = "30d") {
		return await cacheService.getCached(
			`progress:v2:${userId}:${period}`,
			600, // 10 minutos
			async () => {
				const user = await usersRepository.findById(userId)
				if (!user) throw new Error("User not found")

				// Determinar número de dias
				const days = this.getPeriodDays(period)

				// Buscar completions do usuário
				const completions = await this.getCompletionsWithXp(userId)

				// Gerar históricos
				const xpByDay = this.createXpByDayMap(completions)
				const daysToShow = this.calculateDaysToShow(completions, days)

				const xpHistory = this.generateXpHistory(xpByDay, daysToShow)
				const streakHistory = this.generateStreakHistory(xpByDay, daysToShow)
				const goalsHistory = await this.generateGoalsHistory(
					completions,
					daysToShow,
				)

				// Buscar distribuição de achievements
				const achievementDistribution =
					await this.getAchievementDistribution(userId)

				// Estatísticas de metas
				const stats = await this.getGoalStats(userId, user)

				return {
					xpHistory,
					streakHistory,
					goalsHistory,
					achievementDistribution,
					stats,
				}
			},
		)
	},

	/**
	 * Converter período em número de dias
	 */
	getPeriodDays(period: Period): number {
		switch (period) {
			case "7d":
				return 7
			case "30d":
				return 30
			case "90d":
				return 90
			default:
				return 180
		}
	},

	/**
	 * Buscar completions com XP reward
	 */
	async getCompletionsWithXp(userId: string) {
		return await db
			.select({
				completedAt: goalCompletions.completedAt,
				xpReward: sql<number>`(SELECT xp_reward FROM goals WHERE id = ${goalCompletions.goalId})`,
			})
			.from(goalCompletions)
			.where(eq(goalCompletions.userId, userId))
			.orderBy(goalCompletions.completedAt)
	},

	/**
	 * Criar mapa de XP por dia
	 */
	createXpByDayMap(completions: any[]): Map<string, number> {
		const xpByDay = new Map<string, number>()
		for (const completion of completions) {
			const dateKey = new Date(completion.completedAt)
				.toISOString()
				.split("T")[0]
			xpByDay.set(dateKey, (xpByDay.get(dateKey) || 0) + (completion.xpReward || 0))
		}
		return xpByDay
	},

	/**
	 * Calcular quantos dias mostrar no gráfico
	 */
	calculateDaysToShow(completions: any[], maxDays: number): number {
		const today = new Date()
		const firstCompletionDate =
			completions.length > 0 ? new Date(completions[0].completedAt) : today

		const daysSinceFirst = Math.ceil(
			(today.getTime() - firstCompletionDate.getTime()) / (1000 * 60 * 60 * 24),
		)
		return Math.min(daysSinceFirst + 1, maxDays)
	},

	/**
	 * Gerar histórico de XP
	 */
	generateXpHistory(
		xpByDay: Map<string, number>,
		daysToShow: number,
	): Array<{ date: string; xp: number; level: number }> {
		const xpHistory: Array<{ date: string; xp: number; level: number }> = []
		const today = new Date()
		let cumulativeXp = 0

		for (let i = daysToShow - 1; i >= 0; i--) {
			const date = new Date(today)
			date.setDate(date.getDate() - i)
			const dateKey = date.toISOString().split("T")[0]

			const dayXp = xpByDay.get(dateKey) || 0
			cumulativeXp += dayXp

			const level = Math.max(1, Math.floor(cumulativeXp / 100) + 1)

			xpHistory.push({
				date: date.toLocaleDateString("pt-BR", {
					day: "2-digit",
					month: "short",
				}),
				xp: cumulativeXp,
				level,
			})
		}

		return xpHistory
	},

	/**
	 * Gerar histórico de streak
	 */
	generateStreakHistory(
		xpByDay: Map<string, number>,
		daysToShow: number,
	): Array<{ date: string; streak: number }> {
		const streakHistory: Array<{ date: string; streak: number }> = []
		const today = new Date()
		let currentStreakCount = 0

		for (let i = daysToShow - 1; i >= 0; i--) {
			const date = new Date(today)
			date.setDate(date.getDate() - i)
			const dateKey = date.toISOString().split("T")[0]

			if (xpByDay.has(dateKey)) {
				currentStreakCount++
			} else {
				currentStreakCount = 0
			}

			streakHistory.push({
				date: date.toLocaleDateString("pt-BR", {
					day: "2-digit",
					month: "short",
				}),
				streak: currentStreakCount,
			})
		}

		return streakHistory
	},

	/**
	 * Gerar histórico de metas por semana
	 */
	async generateGoalsHistory(
		completions: any[],
		daysToShow: number,
	): Promise<Array<{ week: string; completed: number; target: number }>> {
		const goalsHistory: Array<{
			week: string
			completed: number
			target: number
		}> = []
		const today = new Date()
		const weeks = Math.ceil(daysToShow / 7)

		for (let i = weeks - 1; i >= 0; i--) {
			const weekStart = new Date(today)
			weekStart.setDate(weekStart.getDate() - i * 7)
			weekStart.setHours(0, 0, 0, 0)

			const weekEnd = new Date(weekStart)
			weekEnd.setDate(weekEnd.getDate() + 7)

			const weekCompletions = completions.filter((c) => {
				const completedDate = new Date(c.completedAt)
				return completedDate >= weekStart && completedDate < weekEnd
			})

			const weekLabel = weekStart.toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "short",
			})

			goalsHistory.push({
				week: weekLabel,
				completed: weekCompletions.length,
				target: Math.max(weekCompletions.length, 5),
			})
		}

		return goalsHistory
	},

	/**
	 * Buscar distribuição de achievements por categoria
	 */
	async getAchievementDistribution(userId: string) {
		const achievementsByCategory =
			await achievementsRepository.countByCategory(userId)

		const categoryColors: Record<string, string> = {
			STREAK: "#f97316",
			XP: "#a855f7",
			LEVEL: "#eab308",
			GOALS_COMPLETED: "#3b82f6",
		}

		const categoryLabels: Record<string, string> = {
			STREAK: "Sequência",
			XP: "Experiência",
			LEVEL: "Nível",
			GOALS_COMPLETED: "Metas",
		}

		return Object.entries(achievementsByCategory).map(([category, count]) => ({
			category: categoryLabels[category] || category,
			count,
			color: categoryColors[category] || "#6b7280",
		}))
	},

	/**
	 * Buscar estatísticas de metas
	 */
	async getGoalStats(userId: string, user: any) {
		const now = new Date()

		// Contar total de completions
		const completionsCount = await goalCompletionsRepository.countByUser(userId)

		// Contar total de goals criadas
		const [totalGoalsCreated] = await db
			.select({ count: sql<number>`count(*)` })
			.from(goals)
			.where(eq(goals.userId, userId))

		// Contar goals ativas
		const [activeGoals] = await db
			.select({ count: sql<number>`count(*)` })
			.from(goals)
			.where(eq(goals.userId, userId))

		// Taxa de conclusão semanal
		const startOfCurrentWeek = new Date(now)
		const dayOfWeek = now.getDay()
		startOfCurrentWeek.setDate(now.getDate() - dayOfWeek)
		startOfCurrentWeek.setHours(0, 0, 0, 0)

		const [weekCompletions] = await db
			.select({ count: sql<number>`count(*)` })
			.from(goalCompletions)
			.where(
				and(
					eq(goalCompletions.userId, userId),
					gte(goalCompletions.completedAt, startOfCurrentWeek),
				),
			)

		const activeGoalsThisWeek = await db
			.select()
			.from(goals)
			.where(
				and(
					eq(goals.userId, userId),
					gte(goals.createdAt, startOfCurrentWeek),
				),
			)

		const totalWeeklyTarget = activeGoalsThisWeek.reduce(
			(sum, goal) => sum + goal.desiredWeeklyFrequency,
			0,
		)

		const weeklyCompletionRate =
			totalWeeklyTarget > 0
				? Math.round((Number(weekCompletions.count) / totalWeeklyTarget) * 100)
				: 0

		// Contar total de achievements
		const totalAchievements = await achievementsRepository.countByUser(userId)

		return {
			totalXP: user.experience,
			currentLevel: user.level,
			currentStreak: user.currentStreak,
			longestStreak: user.longestStreak,
			totalGoalsCompleted: completionsCount,
			totalAchievements,
			totalGoalsCreated: Number(totalGoalsCreated.count),
			activeGoals: Number(activeGoals.count),
			weeklyCompletionRate,
		}
	},
}
