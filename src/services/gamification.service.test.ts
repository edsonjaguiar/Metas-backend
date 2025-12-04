import { describe, it, expect } from "bun:test"
import { gamificationService } from "./gamification.service"

describe("GamificationService", () => {
	describe("calculateStreak", () => {
		it("should start a new streak if no last interaction", () => {
			const result = gamificationService.calculateStreak(null, 0, 0)
			expect(result.currentStreak).toBe(1)
			expect(result.shouldUpdate).toBe(true)
		})

		it("should not update streak if interaction was today", () => {
			const now = new Date()
			const result = gamificationService.calculateStreak(now, 5, 5)
			expect(result.currentStreak).toBe(5)
			expect(result.shouldUpdate).toBe(false)
		})

		it("should increment streak if interaction was yesterday", () => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			
			const result = gamificationService.calculateStreak(yesterday, 5, 5)
			expect(result.currentStreak).toBe(6)
			expect(result.longestStreak).toBe(6)
			expect(result.shouldUpdate).toBe(true)
		})

		it("should maintain streak (grace period) if interaction was day before yesterday", () => {
			const dayBeforeYesterday = new Date()
			dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
			
			const result = gamificationService.calculateStreak(dayBeforeYesterday, 5, 5)
			expect(result.currentStreak).toBe(5)
			expect(result.shouldUpdate).toBe(true)
		})

		it("should reset streak if interaction was older than 2 days", () => {
			const threeDaysAgo = new Date()
			threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
			
			const result = gamificationService.calculateStreak(threeDaysAgo, 5, 10)
			expect(result.currentStreak).toBe(1)
			expect(result.longestStreak).toBe(10) // Should keep historical max
			expect(result.shouldUpdate).toBe(true)
		})
	})

	describe("addXp", () => {
		it("should add XP without leveling up", () => {
			const result = gamificationService.addXp(0, 0, 1, 100, 50)
			expect(result.experience).toBe(50)
			expect(result.level).toBe(1)
		})

		it("should level up when XP exceeds threshold", () => {
			// Level 1 needs 100 XP. Current 90 + 20 = 110. Should be Level 2 with 10 XP.
			const result = gamificationService.addXp(90, 90, 1, 100, 20)
			expect(result.level).toBe(2)
			expect(result.experience).toBe(10)
			expect(result.totalExperience).toBe(110)
		})

		it("should handle multiple level ups", () => {
			// Level 1 needs 100 XP. Level 2 needs 283 XP (approx).
			// Adding 1000 XP from 0.
			const result = gamificationService.addXp(0, 0, 1, 100, 1000)
			expect(result.level).toBeGreaterThan(2)
			expect(result.totalExperience).toBe(1000)
		})
	})
})
