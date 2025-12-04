import type { Achievement } from "@/lib/achievements"

// ============================================================================
// Goals Types
// ============================================================================

export interface CreateGoalData {
	title: string
	desiredWeeklyFrequency: number
}

export interface UpdateGoalData {
	title?: string
	desiredWeeklyFrequency?: number
}

export interface CompleteGoalResult {
	completed: boolean
	xpGained?: number
	xpLost?: number
	newStreak?: number
	achievementsUnlocked?: Achievement[]
}

export interface DeleteGoalResult {
	message: string
	xpLost: number
	completionsDeleted: number
}

// ============================================================================
// Users Types
// ============================================================================

export interface UpdateProfileData {
	name?: string
	image?: string
	cloudinaryPublicId?: string
}

export interface UserStats {
	currentStreak: number
	experience: number
	level: number
	goalsCompleted: number
}

export interface GamificationUpdate {
	experience: number
	totalExperience: number
	level: number
	experienceToNextLevel: number
	currentStreak?: number
	longestStreak?: number
	lastInteractionDate?: Date
}

export interface RankingUser {
	id: string
	name: string
	image: string | null
	level: number
	experience: number
	currentStreak: number
	completedGoals: number
	position: number
}

export interface RankingResult {
	rankings: RankingUser[]
	currentUserPosition: number
	totalUsers: number
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheOptions {
	ttl?: number // Time to live in seconds
}

// ============================================================================
// Gamification Types
// ============================================================================

export interface StreakCalculationResult {
	currentStreak: number
	longestStreak: number
	shouldUpdate: boolean
}

export interface XpCalculationResult {
	experience: number
	totalExperience: number
	level: number
	experienceToNextLevel: number
}
