import { Hono } from "hono"
import { cors } from "hono/cors"
import routes from "./http/routes"
import { auth } from "./lib/auth"

const app = new Hono()

app.use(
	"/*",
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization", "Cookie"],
		exposeHeaders: ["Set-Cookie"],
	}),
)

app.on(["POST", "GET"], "/api/auth/**", (c) => {
	return auth.handler(c.req.raw)
})

app.route("/api", routes)
app.get("/", (c) => c.text("API Running!"))

export default app
