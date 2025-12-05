import { Hono } from "hono"
import { cors } from "hono/cors"
import routes from "./http/routes"
import { auth } from "./lib/auth"

const app = new Hono()

const isProduction = process.env.NODE_ENV === "production"

app.use(
	"/*",
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization", "Cookie"],
		exposeHeaders: ["Set-Cookie"],
	}),
)

app.on(["POST", "GET"], "/api/auth/**", async (c) => {
	const response = await auth.handler(c.req.raw)
	
	// Em produção, modificar cookies para SameSite=None
	if (isProduction) {
		const setCookieHeaders = response.headers.getSetCookie()
		if (setCookieHeaders.length > 0) {
			// Remover headers Set-Cookie existentes
			response.headers.delete("Set-Cookie")
			
			// Adicionar novamente com SameSite=None
			for (const cookie of setCookieHeaders) {
				// Substituir SameSite=Lax ou Strict por None
				const modifiedCookie = cookie
					.replace(/SameSite=(Lax|Strict)/gi, "SameSite=None")
					.replace(/;(\s*)Secure/gi, "") + "; Secure"
				
				response.headers.append("Set-Cookie", modifiedCookie)
			}
		}
	}
	
	return response
})

app.route("/api", routes)
app.get("/", (c) => c.text("API Running!"))

export default app
