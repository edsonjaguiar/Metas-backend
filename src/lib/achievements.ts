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
		icon: "flame",
		requirement: 3,
		category: "streak",
	},
	{
		id: "streak_silver",
		title: "Comprometido",
		description: "Mantenha 7 dias de sequência",
		tier: AchievementTier.SILVER,
		icon: "flame",
		requirement: 7,
		category: "streak",
	},
	{
		id: "streak_silver_2",
		title: "Fogo na Roupa",
		description: "Mantenha 14 dias de sequência",
		tier: AchievementTier.SILVER,
		icon: "flame",
		requirement: 14,
		category: "streak",
	},
	{
		id: "streak_gold",
		title: "Imparável",
		description: "Mantenha 30 dias de sequência",
		tier: AchievementTier.GOLD,
		icon: "shield",
		requirement: 30,
		category: "streak",
	},
	{
		id: "streak_gold_2",
		title: "Veterano das Chamas",
		description: "Mantenha 60 dias de sequência",
		tier: AchievementTier.GOLD,
		icon: "shield",
		requirement: 60,
		category: "streak",
	},
	{
		id: "streak_platinum",
		title: "Lendário",
		description: "Mantenha 100 dias de sequência",
		tier: AchievementTier.PLATINUM,
		icon: "timer",
		requirement: 100,
		category: "streak",
	},
	{
		id: "streak_platinum_2",
		title: "Mestre do Tempo",
		description: "Mantenha 200 dias de sequência",
		tier: AchievementTier.PLATINUM,
		icon: "timer",
		requirement: 200,
		category: "streak",
	},
	{
		id: "streak_diamond",
		title: "Imortal",
		description: "Mantenha 365 dias de sequência",
		tier: AchievementTier.DIAMOND,
		icon: "infinity",
		requirement: 365,
		category: "streak",
	},

	// XP
	{
		id: "xp_bronze",
		title: "Novato",
		description: "Acumule 250 XP",
		tier: AchievementTier.BRONZE,
		icon: "zap",
		requirement: 250,
		category: "xp",
	},
	{
		id: "xp_bronze_2",
		title: "Ganhei Uns Pontos",
		description: "Acumule 750 XP",
		tier: AchievementTier.BRONZE,
		icon: "star",
		requirement: 750,
		category: "xp",
	},
	{
		id: "xp_silver",
		title: "Experiente",
		description: "Acumule 1.250 XP",
		tier: AchievementTier.SILVER,
		icon: "zap",
		requirement: 1250,
		category: "xp",
	},
	{
		id: "xp_gold_low",
		title: "Caçador de Recompensas",
		description: "Acumule 2.500 XP",
		tier: AchievementTier.GOLD,
		icon: "award",
		requirement: 2500,
		category: "xp",
	},
	{
		id: "xp_gold",
		title: "Veterano",
		description: "Acumule 5.000 XP",
		tier: AchievementTier.GOLD,
		icon: "zap",
		requirement: 5000,
		category: "xp",
	},
	{
		id: "xp_platinum_low",
		title: "Elite de Elite",
		description: "Acumule 10.000 XP",
		tier: AchievementTier.PLATINUM,
		icon: "award",
		requirement: 10000,
		category: "xp",
	},
	{
		id: "xp_platinum",
		title: "Elite",
		description: "Acumule 15.000 XP",
		tier: AchievementTier.PLATINUM,
		icon: "zap",
		requirement: 15000,
		category: "xp",
	},
	{
		id: "xp_diamond",
		title: "Transcendente",
		description: "Acumule 30.000 XP",
		tier: AchievementTier.DIAMOND,
		icon: "milestone",
		requirement: 30000,
		category: "xp",
	},

	// Level
	{
		id: "level_bronze",
		title: "Aprendiz",
		description: "Alcance o nível 5",
		tier: AchievementTier.BRONZE,
		icon: "crown",
		requirement: 5,
		category: "level",
	},
	{
		id: "level_silver",
		title: "Mestre",
		description: "Alcance o nível 10",
		tier: AchievementTier.SILVER,
		icon: "crown",
		requirement: 10,
		category: "level",
	},
	{
		id: "level_silver_2",
		title: "Cavaleiro",
		description: "Alcance o nível 20",
		tier: AchievementTier.SILVER,
		icon: "shield-alert",
		requirement: 20,
		category: "level",
	},
	{
		id: "level_gold",
		title: "Grão-Mestre",
		description: "Alcance o nível 25",
		tier: AchievementTier.GOLD,
		icon: "crown",
		requirement: 25,
		category: "level",
	},
	{
		id: "level_gold_2",
		title: "Especialista",
		description: "Alcance o nível 40",
		tier: AchievementTier.GOLD,
		icon: "award",
		requirement: 40,
		category: "level",
	},
	{
		id: "level_platinum",
		title: "Campeão",
		description: "Alcance o nível 50",
		tier: AchievementTier.PLATINUM,
		icon: "crown",
		requirement: 50,
		category: "level",
	},
	{
		id: "level_platinum_2",
		title: "Semideus",
		description: "Alcance o nível 75",
		tier: AchievementTier.PLATINUM,
		icon: "gem",
		requirement: 75,
		category: "level",
	},
	{
		id: "level_diamond",
		title: "Divino",
		description: "Alcance o nível 100",
		tier: AchievementTier.DIAMOND,
		icon: "crown",
		requirement: 100,
		category: "level",
	},

	// Goals Completed
	{
		id: "goals_bronze",
		title: "Primeiro Passo",
		description: "Complete sua primeira meta",
		tier: AchievementTier.BRONZE,
		icon: "target",
		requirement: 1,
		category: "goals_completed",
	},
	{
		id: "goals_bronze_2",
		title: "Saindo da Inércia",
		description: "Complete 5 metas",
		tier: AchievementTier.BRONZE,
		icon: "rocket",
		requirement: 5,
		category: "goals_completed",
	},
	{
		id: "goals_silver",
		title: "Persistente",
		description: "Complete 15 metas",
		tier: AchievementTier.SILVER,
		icon: "target",
		requirement: 15,
		category: "goals_completed",
	},
	{
		id: "goals_gold_low",
		title: "Máquina de Concluir",
		description: "Complete 30 metas",
		tier: AchievementTier.GOLD,
		icon: "check-circle",
		requirement: 30,
		category: "goals_completed",
	},
	{
		id: "goals_gold",
		title: "Determinado",
		description: "Complete 75 metas",
		tier: AchievementTier.GOLD,
		icon: "medal",
		requirement: 75,
		category: "goals_completed",
	},
	{
		id: "goals_platinum_low",
		title: "Inabalável",
		description: "Complete 150 metas",
		tier: AchievementTier.PLATINUM,
		icon: "award",
		requirement: 150,
		category: "goals_completed",
	},
	{
		id: "goals_platinum",
		title: "Incansável",
		description: "Complete 250 metas",
		tier: AchievementTier.PLATINUM,
		icon: "target",
		requirement: 250,
		category: "goals_completed",
	},
	{
		id: "goals_diamond",
		title: "Mestre das Metas",
		description: "Complete 500 metas",
		tier: AchievementTier.DIAMOND,
		icon: "medal",
		requirement: 500,
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
