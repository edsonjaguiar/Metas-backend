import { eq, sql } from "drizzle-orm"
import { db } from "@/database/client"
import { users } from "@/database/schema/users"
import { goalCompletions } from "@/database/schema/goals-completions"
import type { GamificationUpdate, UpdateProfileData } from "@/types"

/**
 * Users Repository - Acesso ao banco de dados para users
 */
export const usersRepository = {
	/**
	 * Buscar usuário por ID
	 */
	async findById(userId: string) {
		const [user] = await db.select().from(users).where(eq(users.id, userId))
		return user || null
	},

	/**
	 * Atualizar perfil do usuário
	 */
	async updateProfile(userId: string, data: UpdateProfileData) {
		const [updated] = await db
			.update(users)
			.set(data)
			.where(eq(users.id, userId))
			.returning()

		return updated
	},

	/**
	 * Atualizar dados de gamificação do usuário
	 */
	async updateGamification(userId: string, data: GamificationUpdate) {
		await db.update(users).set(data).where(eq(users.id, userId))
	},

	/**
	 * Buscar ranking de usuários
	 */
	async getRanking(category: "xp" | "level" | "streak", limit = 50) {
		let orderByClause

		switch (category) {
			case "streak":
				orderByClause = sql`${users.currentStreak} DESC, ${users.experience} DESC`
				break
			case "level":
				orderByClause = sql`${users.level} DESC, ${users.experience} DESC`
				break
			case "xp":
			default:
				orderByClause = sql`${users.experience} DESC, ${users.level} DESC`
				break
		}

		const rankingQuery = sql`
			SELECT
				${users.id},
				${users.name},
				${users.image},
				${users.level},
				${users.experience},
				${users.currentStreak},
				${users.completedGoals},
				RANK() OVER (
					ORDER BY 
						${orderByClause},
						${users.completedGoals} DESC
				) as position
			FROM ${users}
		`

		const result = await db.execute(sql`
			${rankingQuery}
			LIMIT ${limit}
		`)

		return result.rows as any[]
	},

	/**
	 * Buscar posição de um usuário específico no ranking
	 */
	async getUserRank(userId: string, category: "xp" | "level" | "streak") {
		let orderByClause

		switch (category) {
			case "streak":
				orderByClause = sql`${users.currentStreak} DESC, ${users.experience} DESC`
				break
			case "level":
				orderByClause = sql`${users.level} DESC, ${users.experience} DESC`
				break
			case "xp":
			default:
				orderByClause = sql`${users.experience} DESC, ${users.level} DESC`
				break
		}

		const rankingQuery = sql`
			WITH ranked_users AS (
				SELECT
					${users.id},
					${users.name},
					${users.image},
					${users.level},
					${users.experience},
					${users.currentStreak},
					${users.completedGoals},
					RANK() OVER (
						ORDER BY 
							${orderByClause},
							${users.completedGoals} DESC
					) as position
				FROM ${users}
			)
			SELECT * FROM ranked_users
			WHERE id = ${userId}
		`

		const result = await db.execute(rankingQuery)
		return result.rows[0] as any
	},

	/**
	 * Contar total de usuários
	 */
	async count() {
		const [result] = await db
			.select({ count: sql<number>`count(*)` })
			.from(users)

		return Number(result.count)
	},
}
