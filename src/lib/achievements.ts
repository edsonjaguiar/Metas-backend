export enum AchievementTier {
	BRONZE = "bronze",
	SILVER = "silver",
	GOLD = "gold",
	PLATINUM = "platinum",
	DIAMOND = "diamond",
}

export interface Achievement {
	id: string
	title: string
	description: string
	tier: AchievementTier
	icon: string
	requirement: number
	category: "streak" | "xp" | "level" | "goals_completed"
}

export const ACHIEVEMENTS: Achievement[] = [
	// Streak
	{
		id: "streak_bronze",
		title: "Iniciante Dedicado",
		description: "Mantenha 3 dias de sequência",
		tier: AchievementTier.BRONZE,
		icon: "🔥",
		requirement: 3,
		category: "streak",
	},
	{
		id: "streak_silver",
		title: "Comprometido",
		description: "Mantenha 7 dias de sequência",
		tier: AchievementTier.SILVER,
		icon: "🔥",
		requirement: 7,
		category: "streak",
	},
	{
		id: "streak_gold",
		title: "Imparável",
		description: "Mantenha 30 dias de sequência",
		tier: AchievementTier.GOLD,
		icon: "🔥",
		requirement: 30,
		category: "streak",
	},
	{
		id: "streak_platinum",
		title: "Lendário",
		description: "Mantenha 100 dias de sequência",
		tier: AchievementTier.PLATINUM,
		icon: "🔥",
		requirement: 100,
		category: "streak",
	},
	{
		id: "streak_diamond",
		title: "Imortal",
		description: "Mantenha 365 dias de sequência",
		tier: AchievementTier.DIAMOND,
		icon: "🔥",
		requirement: 365,
		category: "streak",
	},

	// XP
	{
		id: "xp_bronze",
		title: "Novato",
		description: "Acumule 100 XP",
		tier: AchievementTier.BRONZE,
		icon: "⚡",
		requirement: 100,
		category: "xp",
	},
	{
		id: "xp_silver",
		title: "Experiente",
		description: "Acumule 1.000 XP",
		tier: AchievementTier.SILVER,
		icon: "⚡",
		requirement: 1000,
		category: "xp",
	},
	{
		id: "xp_gold",
		title: "Veterano",
		description: "Acumule 10.000 XP",
		tier: AchievementTier.GOLD,
		icon: "⚡",
		requirement: 10000,
		category: "xp",
	},
	{
		id: "xp_platinum",
		title: "Elite",
		description: "Acumule 50.000 XP",
		tier: AchievementTier.PLATINUM,
		icon: "⚡",
		requirement: 50000,
		category: "xp",
	},
	{
		id: "xp_diamond",
		title: "Transcendente",
		description: "Acumule 100.000 XP",
		tier: AchievementTier.DIAMOND,
		icon: "⚡",
		requirement: 100000,
		category: "xp",
	},

	// Level
	{
		id: "level_bronze",
		title: "Aprendiz",
		description: "Alcance o nível 5",
		tier: AchievementTier.BRONZE,
		icon: "👑",
		requirement: 5,
		category: "level",
	},
	{
		id: "level_silver",
		title: "Mestre",
		description: "Alcance o nível 10",
		tier: AchievementTier.SILVER,
		icon: "👑",
		requirement: 10,
		category: "level",
	},
	{
		id: "level_gold",
		title: "Grão-Mestre",
		description: "Alcance o nível 25",
		tier: AchievementTier.GOLD,
		icon: "👑",
		requirement: 25,
		category: "level",
	},
	{
		id: "level_platinum",
		title: "Campeão",
		description: "Alcance o nível 50",
		tier: AchievementTier.PLATINUM,
		icon: "👑",
		requirement: 50,
		category: "level",
	},
	{
		id: "level_diamond",
		title: "Divino",
		description: "Alcance o nível 100",
		tier: AchievementTier.DIAMOND,
		icon: "👑",
		requirement: 100,
		category: "level",
	},

	// Goals Completed
	{
		id: "goals_bronze",
		title: "Primeiro Passo",
		description: "Complete sua primeira meta",
		tier: AchievementTier.BRONZE,
		icon: "🎯",
		requirement: 1,
		category: "goals_completed",
	},
	{
		id: "goals_silver",
		title: "Persistente",
		description: "Complete 10 metas",
		tier: AchievementTier.SILVER,
		icon: "🎯",
		requirement: 10,
		category: "goals_completed",
	},
	{
		id: "goals_gold",
		title: "Determinado",
		description: "Complete 50 metas",
		tier: AchievementTier.GOLD,
		icon: "🎯",
		requirement: 50,
		category: "goals_completed",
	},
	{
		id: "goals_platinum",
		title: "Incansável",
		description: "Complete 200 metas",
		tier: AchievementTier.PLATINUM,
		icon: "🎯",
		requirement: 200,
		category: "goals_completed",
	},
	{
		id: "goals_diamond",
		title: "Mestre das Metas",
		description: "Complete 1000 metas",
		tier: AchievementTier.DIAMOND,
		icon: "🎯",
		requirement: 1000,
		category: "goals_completed",
	},
]

/**
 * Verifica quais conquistas devem ser desbloqueadas
 */
export const checkNewAchievements = (
	user: {
		currentStreak: number
		experience: number
		level: number
		goalsCompleted: number
	},
	unlockedIds: string[],
): Achievement[] => {
	const newAchievements: Achievement[] = []

	for (const achievement of ACHIEVEMENTS) {
		// Já desbloqueou? Pular
		if (unlockedIds.includes(achievement.id)) continue

		// Verificar se atingiu requisito
		let shouldUnlock = false
		switch (achievement.category) {
			case "streak":
				shouldUnlock = user.currentStreak >= achievement.requirement
				break
			case "xp":
				shouldUnlock = user.experience >= achievement.requirement
				break
			case "level":
				shouldUnlock = user.level >= achievement.requirement
				break
			case "goals_completed":
				shouldUnlock = user.goalsCompleted >= achievement.requirement
				break
		}

		if (shouldUnlock) {
			newAchievements.push(achievement)
		}
	}

	return newAchievements
}
