import type { Context } from "hono"
import type { AuthContext } from "@/http/middlewares/auth.middleware"
import { achievementsService } from "@/services/achievements.service"

/**
 * Achievements Controller - Handlers HTTP para achievements
 */
export const achievementsController = {
	/**
	 * GET /achievements - Listar achievements do usuário
	 */
	async list(c: Context<AuthContext>) {
		const user = c.get("user")

		const achievements = await achievementsService.listUserAchievements(user.id)

		return c.json(achievements)
	},
}
