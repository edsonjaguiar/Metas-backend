import { zValidator } from "@hono/zod-validator"
import { and, eq, gte, sql } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"
import { goalCompletions } from "@/database/schema/goals-completions"
import { goals } from "@/database/schema/goals"
import { db } from "../../database/client"
import { users } from "../../database/schema/users"
import type { AuthContext } from "../middlewares/auth.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import { usersController } from "../controllers/users.controller"
import { cache } from "@/lib/redis"
import { userAchievements } from "@/database/schema/achievements"

const app = new Hono<AuthContext>()

app.use("*", authMiddleware)

// Schemas de validação
const updateProfileSchema = z.object({
	name: z.string().min(1).optional(),
	image: z.string().url().optional(),
	cloudinaryPublicId: z.string().optional(),
})

// Rotas
app.get("/me", usersController.getMe)
app.patch("/me", zValidator("json", updateProfileSchema), usersController.updateMe)
app.get("/ranking", usersController.getRanking)
app.get("/progress", usersController.getProgress)

export default app
