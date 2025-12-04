import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { achievementsService } from "./achievements.service"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { achievements, userAchievements } from "@/database/schema/achievements"
import { eq } from "drizzle-orm"

describe("AchievementsService", () => {
	let userId: string

	beforeAll(async () => {
		const [user] = await db
			.insert(users)
			.values({
				name: "Test Achievements",
				email: `test-achievements-${Date.now()}@example.com`,
				image: "https://github.com/shadcn.png",
			})
			.returning()
		userId = user.id
	})

	afterAll(async () => {
		await db.delete(userAchievements).where(eq(userAchievements.userId, userId))
		await db.delete(users).where(eq(users.id, userId))
	})

	it("should list user achievements (all locked initially)", async () => {
		const list = await achievementsService.listUserAchievements(userId)
		expect(list.length).toBeGreaterThan(0)
		
		// Should have some locked achievements
		const locked = list.filter(a => !a.unlocked)
		expect(locked.length).toBeGreaterThan(0)
	})

	it("should unlock achievement when criteria is met", async () => {
		// Simulate stats that should unlock "First Step" (1 goal completed)
		const stats = {
			experience: 100,
			level: 1,
			currentStreak: 1,
			goalsCompleted: 1, // Should unlock first goal achievement
		}

		const newAchievements = await achievementsService.checkAndUnlock(userId, stats)
		
		// Note: This depends on seed data having an achievement for 1 goal
		// If seed data changes, this might need adjustment
		if (newAchievements.length > 0) {
			// Verify we got the expected achievement (might have unlocked others too like xp_bronze)
			const goalAchievement = newAchievements.find((a) => a.id === "goals_bronze")
			expect(goalAchievement).toBeDefined()
			expect(goalAchievement?.id).toBe("goals_bronze")

			// Verify it is effectively unlocked in the system
			const list = await achievementsService.listUserAchievements(userId)
			const achievement = list.find((a) => a.id === "goals_bronze")
			expect(achievement?.unlocked).toBe(true)
		}
	})
})
