import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { usersService } from "./users.service"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { eq } from "drizzle-orm"

describe("UsersService", () => {
	let userId: string

	beforeAll(async () => {
		const [user] = await db
			.insert(users)
			.values({
				name: "Test User Service",
				email: `test-service-${Date.now()}@example.com`,
				image: "https://github.com/shadcn.png",
				experience: 1000,
				level: 5,
			})
			.returning()
		userId = user.id
	})

	afterAll(async () => {
		await db.delete(users).where(eq(users.id, userId))
	})

	it("should get user profile", async () => {
		const profile = await usersService.getProfile(userId)
		expect(profile).toBeDefined()
		expect(profile.id).toBe(userId)
		expect(profile.name).toBe("Test User Service")
	})

	it("should update user profile", async () => {
		const newName = "Updated Name"
		const updated = await usersService.updateProfile(userId, { name: newName })
		expect(updated.name).toBe(newName)
	})

	it("should get ranking", async () => {
		const ranking = await usersService.getRanking(userId, "xp")
		expect(ranking.rankings.length).toBeGreaterThan(0)
		expect(ranking.currentUserPosition).toBeGreaterThan(0)
		
		const userInRanking = ranking.rankings.find(u => u.id === userId)
		expect(userInRanking).toBeDefined()
	})
})
