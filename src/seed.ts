import { db } from "./database/client"
import { achievements } from "./database/schema/achievements"
import { ACHIEVEMENTS } from "./lib/achievements"
import { users } from "./database/schema/users"
import { goals } from "./database/schema/goals"
import { goalCompletions } from "./database/schema/goals-completions"
import { calculateXpReward } from "./lib/calculate-xp"

async function seed() {
	console.log("🌱 Seeding database...")

	// 1. Seeding Achievements
	console.log("🏆 Seeding achievements...")
	for (const achievement of ACHIEVEMENTS) {
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
			.onConflictDoNothing()
	}

	// 2. Create Test User
	console.log("👤 Creating test user...")
	const [user] = await db
		.insert(users)
		.values({
			name: "Test User",
			email: "test@example.com",
			image: "https://github.com/shadcn.png",
			experience: 0,
			level: 1,
			experienceToNextLevel: 100,
		})
		.returning()

	// 3. Create Goals
	console.log("🎯 Creating goals...")
	const goalsData = [
		{ title: "Beber 2L de água", frequency: 7 },
		{ title: "Ler 10 páginas", frequency: 5 },
		{ title: "Exercício físico", frequency: 3 },
		{ title: "Meditar", frequency: 7 },
	]

	const createdGoals = []
	for (const g of goalsData) {
		const [goal] = await db
			.insert(goals)
			.values({
				userId: user.id,
				title: g.title,
				desiredWeeklyFrequency: g.frequency,
				xpReward: calculateXpReward(g.frequency),
			})
			.returning()
		createdGoals.push(goal)
	}

	// 4. Create History (Last 30 days)
	console.log("📅 Creating history...")
	const now = new Date()
	const completions = []

	for (let i = 30; i >= 0; i--) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		
		// Randomly complete goals
		for (const goal of createdGoals) {
			// 60% chance to complete a goal on any given day
			if (Math.random() > 0.4) {
				completions.push({
					goalId: goal.id,
					userId: user.id,
					completedAt: date,
				})
			}
		}
	}

	if (completions.length > 0) {
		await db.insert(goalCompletions).values(completions)
	}

	console.log(`✨ Seed completed! Created user ${user.id} with ${completions.length} completions.`)
	process.exit(0)
}

seed().catch((error) => {
	console.error("❌ Seed failed:", error)
	process.exit(1)
})
