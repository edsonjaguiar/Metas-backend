import { db } from "./database/client"
import { achievements } from "./database/schema/achievements"
import { ACHIEVEMENTS } from "./lib/achievements"

/**
 * Seed apenas para achievements (produção)
 * Não cria usuários de teste
 */
async function seedAchievements() {
	console.log("🏆 Seeding achievements...")
	
	for (const achievement of ACHIEVEMENTS) {
		console.log(`Checking achievement: ${achievement.id}`)
		await db
			.insert(achievements)
			.values({
				id: achievement.id,
				name: achievement.title,
				description: achievement.description,
				icon: achievement.icon,
				xpReward: 0,
				criteriaType: achievement.category.toUpperCase(),
				criteriaValue: achievement.requirement,
			})
			.onConflictDoUpdate({
				target: achievements.id,
				set: {
					name: achievement.title,
					description: achievement.description,
					icon: achievement.icon,
					criteriaType: achievement.category.toUpperCase(),
					criteriaValue: achievement.requirement,
					updatedAt: new Date(),
				}
			})
	}
	
	console.log(`✨ Seeded ${ACHIEVEMENTS.length} achievements successfully!`)
	process.exit(0)
}

seedAchievements().catch((error) => {
	console.error("❌ Seed failed:", error)
	process.exit(1)
})
