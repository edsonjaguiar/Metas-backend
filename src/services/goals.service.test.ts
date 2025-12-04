import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { goalsService } from "./goals.service"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { goals } from "@/database/schema/goals"
import { eq } from "drizzle-orm"

describe("GoalsService", () => {
	let userId: string

	// Setup: Criar usuário de teste
	beforeAll(async () => {
		const [user] = await db
			.insert(users)
			.values({
				name: "Test User",
				email: `test-${Date.now()}@example.com`,
				image: "https://github.com/shadcn.png",
			})
			.returning()
		userId = user.id
	})

	// Teardown: Limpar dados
	afterAll(async () => {
		await db.delete(users).where(eq(users.id, userId))
	})

	it("should create a goal successfully", async () => {
		const goalData = {
			title: "Test Goal",
			desiredWeeklyFrequency: 3,
		}

		const goal = await goalsService.createGoal(userId, goalData)

		expect(goal).toBeDefined()
		expect(goal.title).toBe(goalData.title)
		expect(goal.desiredWeeklyFrequency).toBe(goalData.desiredWeeklyFrequency)
		expect(goal.userId).toBe(userId)
	})

	it("should calculate XP reward correctly", async () => {
		const goalData = {
			title: "High Frequency Goal",
			desiredWeeklyFrequency: 7,
		}

		const goal = await goalsService.createGoal(userId, goalData)

		// 7 dias = 50 XP (baseado na lógica do calculate-xp)
		expect(goal.xpReward).toBe(50)
	})

	it("should list user goals", async () => {
		const userGoals = await goalsService.listGoals(userId)
		expect(userGoals.length).toBeGreaterThanOrEqual(2)
	})
})
