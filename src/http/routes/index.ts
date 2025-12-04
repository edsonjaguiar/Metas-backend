// src/http/routes/index.ts
import { Hono } from "hono"
import achievementsRoutes from "./achievements.routes"
import goalsRoutes from "./goals.routes"
import usersRoutes from "./users.routes"

const routes = new Hono()

// Monta as rotas
routes.route("/goals", goalsRoutes)
routes.route("/users", usersRoutes)
routes.route("/achievements", achievementsRoutes)
// routes.route("/auth", authRoutes)

export default routes
