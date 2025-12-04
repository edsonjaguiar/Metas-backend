import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import type { AuthContext } from "../middlewares/auth.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import { goalsController } from "../controllers/goals.controller"

const app = new Hono<AuthContext>()

// Middleware de autenticação para todas as rotas
app.use("*", authMiddleware)

// Schemas de validação
const createGoalSchema = z.object({
	title: z.string().min(1, "O título é obrigatório"),
	desiredWeeklyFrequency: z.number().min(1).max(7),
})

const updateGoalSchema = z.object({
	title: z.string().min(1, "O título é obrigatório").optional(),
	desiredWeeklyFrequency: z.number().min(1).max(7).optional(),
})

// Rotas
app.post("/", zValidator("json", createGoalSchema), goalsController.create)
app.patch("/:goalId", zValidator("json", updateGoalSchema), goalsController.update)
app.delete("/:goalId", goalsController.delete)
app.post("/:goalId/complete", goalsController.complete)
app.get("/", goalsController.list)

export default app
