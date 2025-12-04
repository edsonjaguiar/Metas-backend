import type { Context } from "hono"
import type { AuthContext } from "@/http/middlewares/auth.middleware"
import { usersService } from "@/services/users.service"
import { progressService } from "@/services/progress.service"

/**
 * Users Controller - Handlers HTTP para users
 */
export const usersController = {
	/**
	 * GET /users/me - Buscar perfil do usuário
	 */
	async getMe(c: Context<AuthContext>) {
		const sessionUser = c.get("user")

		try {
			const profile = await usersService.getProfile(sessionUser.id)

			c.header("Cache-Control", "no-store")
			return c.json({ ...profile, _debug_timestamp: Date.now() })
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				return c.json({ error: "User not found" }, 404)
			}
			throw error
		}
	},

	/**
	 * PATCH /users/me - Atualizar perfil
	 */
	async updateMe(c: Context<AuthContext, any, any>) {
		const sessionUser = c.get("user")
		const body = c.req.valid("json") as import("@/types").UpdateProfileData

		try {
			const updated = await usersService.updateProfile(sessionUser.id, body)
			return c.json(updated)
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				return c.json({ error: "User not found" }, 404)
			}
			throw error
		}
	},

	/**
	 * GET /users/ranking - Buscar ranking
	 */
	async getRanking(c: Context<AuthContext>) {
		const sessionUser = c.get("user")
		const category = (c.req.query("category") as "xp" | "level" | "streak") || "xp"

		try {
			const ranking = await usersService.getRanking(sessionUser.id, category)
			return c.json(ranking)
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "User not found in ranking"
			) {
				return c.json({ error: "User not found in ranking" }, 404)
			}
			throw error
		}
	},

	/**
	 * GET /users/progress - Buscar dados de progresso
	 */
	async getProgress(c: Context<AuthContext>) {
		const sessionUser = c.get("user")
		const period = (c.req.query("period") as "7d" | "30d" | "90d" | "all") || "30d"

		try {
			const progress = await progressService.getProgress(sessionUser.id, period)
			return c.json(progress)
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				return c.json({ error: "User not found" }, 404)
			}
			throw error
		}
	},
}
