import type { Context } from "hono"
import type { AuthContext } from "@/http/middlewares/auth.middleware"
import { goalsService } from "@/services/goals.service"

/**
 * Goals Controller - Handlers HTTP para goals
 */
export const goalsController = {
	/**
	 * POST /goals - Criar nova goal
	 */
	async create(c: Context<AuthContext, any, any>) {
		const body = c.req.valid("json") as import("@/types").CreateGoalData
		const user = c.get("user")

		const goal = await goalsService.createGoal(user.id, body)

		return c.json(goal, 201)
	},

	/**
	 * PATCH /goals/:goalId - Atualizar goal
	 */
	async update(c: Context<AuthContext, any, any>) {
		const { goalId } = c.req.param()
		const user = c.get("user")
		const body = c.req.valid("json") as import("@/types").UpdateGoalData

		try {
			const updated = await goalsService.updateGoal(goalId, user.id, body)
			return c.json(updated)
		} catch (error) {
			if (error instanceof Error && error.message === "Goal not found") {
				return c.json({ error: "Goal not found" }, 404)
			}
			throw error
		}
	},

	/**
	 * DELETE /goals/:goalId - Deletar goal
	 */
	async delete(c: Context<AuthContext>) {
		const { goalId } = c.req.param()
		const user = c.get("user")

		try {
			const result = await goalsService.deleteGoal(goalId, user.id)
			return c.json(result)
		} catch (error) {
			if (error instanceof Error && error.message === "Goal not found") {
				return c.json({ error: "Goal not found" }, 404)
			}
			throw error
		}
	},

	/**
	 * POST /goals/:goalId/complete - Completar/descompletar goal
	 */
	async complete(c: Context<AuthContext>) {
		const { goalId } = c.req.param()
		const user = c.get("user")

		try {
			const result = await goalsService.completeGoal(goalId, user.id)
			return c.json(result)
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Goal not found") {
					return c.json({ error: "Goal not found" }, 404)
				}
				if (error.message.includes("número máximo de vezes")) {
					return c.json({ error: error.message }, 400)
				}
			}
			throw error
		}
	},

	/**
	 * GET /goals - Listar goals do usuário
	 */
	async list(c: Context<AuthContext>) {
		const user = c.get("user")

		const goals = await goalsService.listGoals(user.id)

		return c.json(goals)
	},
}
