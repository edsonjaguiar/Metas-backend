import type { Context, Next } from "hono"

const isProduction = process.env.NODE_ENV === "production"

/**
 * Security Headers Middleware
 * Adiciona headers de segurança recomendados pela OWASP
 */
export function securityHeaders() {
	return async (c: Context, next: Next) => {
		// Executar primeiro para garantir que os headers são adicionados mesmo em erros
		await next()

		// ===================
		// Clickjacking Protection
		// ===================
		// Previne que a página seja carregada em iframes
		c.header("X-Frame-Options", "DENY")
		// CSP frame-ancestors é mais moderno e flexível
		c.header("Content-Security-Policy", "frame-ancestors 'none'")

		// ===================
		// MIME Sniffing Protection
		// ===================
		// Previne que o browser interprete arquivos como tipos diferentes
		c.header("X-Content-Type-Options", "nosniff")

		// ===================
		// XSS Protection (legado, mas ainda útil)
		// ===================
		// Ativa filtro XSS do browser (browsers modernos já fazem isso)
		c.header("X-XSS-Protection", "1; mode=block")

		// ===================
		// HSTS (HTTP Strict Transport Security)
		// ===================
		// Força uso de HTTPS por 1 ano (apenas em produção)
		if (isProduction) {
			c.header(
				"Strict-Transport-Security",
				"max-age=31536000; includeSubDomains"
			)
		}

		// ===================
		// Referrer Policy
		// ===================
		// Limita informações enviadas no header Referer
		c.header("Referrer-Policy", "strict-origin-when-cross-origin")

		// ===================
		// Permissions Policy (antigo Feature-Policy)
		// ===================
		// Desabilita funcionalidades sensíveis não utilizadas
		c.header(
			"Permissions-Policy",
			"accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
		)

		// ===================
		// Cache Control para respostas sensíveis
		// ===================
		// Previne caching de dados sensíveis
		const path = c.req.path
		if (path.includes("/auth/") || path.includes("/users/me")) {
			c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
			c.header("Pragma", "no-cache")
			c.header("Expires", "0")
		}
	}
}

/**
 * Middleware para remover headers que expõem informações do servidor
 */
export function hideServerInfo() {
	return async (c: Context, next: Next) => {
		await next()
		
		// Remove headers que podem revelar tecnologias usadas
		c.header("X-Powered-By", "") // Remove ou define vazio
		c.header("Server", "") // Remove info do servidor
	}
}
