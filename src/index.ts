import { Hono } from "hono"
import { cors } from "hono/cors"
import routes from "./http/routes"
import { auth } from "./lib/auth"
import { isRedisConnected } from "./lib/redis"
import { env } from "./env"
import { securityHeaders, hideServerInfo } from "./http/middlewares/security-headers.middleware"
import { authRateLimiter, apiRateLimiter } from "./http/middlewares/rate-limit.middleware"
import { migrateGoalsCount } from "./migrate-goals-count"


const app = new Hono()

const isProduction = process.env.NODE_ENV === "production"

// ===================
// Security Middlewares (aplicados a todas as rotas)
// ===================
// Headers de segurança OWASP
app.use("/*", securityHeaders())

// Remove headers que expõem informações do servidor
app.use("/*", hideServerInfo())

// CORS configurado
app.use(
	"/*",
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization", "Cookie"],
		exposeHeaders: ["Set-Cookie", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
	}),
)

// ===================
// Auth endpoints (com rate limiting mais restritivo)
// ===================
app.use("/api/auth/*", authRateLimiter)

app.on(["POST", "GET"], "/api/auth/**", async (c) => {
	const response = await auth.handler(c.req.raw)
	
	// Em produção, modificar cookies para SameSite=None
	if (isProduction) {
		const setCookieHeaders = response.headers.getSetCookie()
		if (setCookieHeaders.length > 0) {
			// Remover headers Set-Cookie existentes
			response.headers.delete("Set-Cookie")
			
			// Adicionar novamente com SameSite=None e Partitioned
			for (const cookie of setCookieHeaders) {
				// Substituir SameSite=Lax ou Strict por None e adicionar Partitioned
				const modifiedCookie = cookie
					.replace(/SameSite=(Lax|Strict)/gi, "SameSite=None")
					.replace(/;(\s*)Secure/gi, "") + "; Secure; Partitioned; Domain=" + new URL(env.FRONTEND_URL).hostname
				
				response.headers.append("Set-Cookie", modifiedCookie)
			}
		}
	}
	
	return response
})

// ===================
// API Routes (com rate limiting geral)
// ===================
app.use("/api/*", apiRateLimiter)
app.route("/api", routes)

// ===================
// Health check (sem rate limiting)
// ===================
app.get("/", (c) => c.text("API Running!"))

app.get("/health", (c) => {
	const redisStatus = isRedisConnected()
	
	return c.json({
		status: "ok",
		redis: redisStatus ? "connected" : "disconnected",
		timestamp: new Date().toISOString(),
	})
})

// Executar migração de contador de metas no startup (Opção 3 do usuário)
migrateGoalsCount().catch(err => console.error("Falha ao sincronizar metas no startup:", err))

export default app

