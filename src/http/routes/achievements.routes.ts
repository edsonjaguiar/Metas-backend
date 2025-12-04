import { Hono } from "hono"
import type { AuthContext } from "../middlewares/auth.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import { achievementsController } from "../controllers/achievements.controller"

const app = new Hono<AuthContext>()

app.use("*", authMiddleware)

// Rotas
app.get("/", achievementsController.list)

export default app
