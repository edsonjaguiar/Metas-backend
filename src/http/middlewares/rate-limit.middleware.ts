import type { Context, Next } from "hono"
import { getRedisClient, isRedisConnected } from "@/lib/redis"

interface RateLimitConfig {
	/** Janela de tempo em segundos */
	windowSeconds: number
	/** Máximo de requisições por janela */
	maxRequests: number
	/** Prefixo da chave no Redis */
	keyPrefix?: string
	/** Mensagem de erro customizada */
	message?: string
}

// Configurações padrão para diferentes tipos de endpoints
export const RATE_LIMIT_PRESETS = {
	// Endpoints de autenticação (mais restritivo - evita brute force)
	auth: {
		windowSeconds: 60,
		maxRequests: 10,
		keyPrefix: "rl:auth:",
		message: "Muitas tentativas de login. Aguarde um minuto.",
	},
	// Endpoints de API geral
	api: {
		windowSeconds: 60,
		maxRequests: 100,
		keyPrefix: "rl:api:",
		message: "Limite de requisições excedido. Tente novamente em breve.",
	},
	// Endpoints de escrita (criação, atualização)
	write: {
		windowSeconds: 60,
		maxRequests: 30,
		keyPrefix: "rl:write:",
		message: "Muitas operações de escrita. Aguarde um momento.",
	},
} as const

/**
 * Rate limiting middleware usando Redis
 * Usa sliding window counter para contagem de requisições
 */
export function rateLimiter(config: RateLimitConfig = RATE_LIMIT_PRESETS.api) {
	return async (c: Context, next: Next) => {
		// Se Redis não estiver conectado, permite a requisição (fail-open)
		if (!isRedisConnected()) {
			console.warn("[RateLimit] Redis not connected, allowing request")
			return next()
		}

		try {
			const redis = getRedisClient()
			
			// Identificador: IP + User-Agent (ou userId se autenticado)
			const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() 
				|| c.req.header("x-real-ip") 
				|| "unknown"
			
			const key = `${config.keyPrefix || "rl:"}${ip}`
			const now = Math.floor(Date.now() / 1000)
			const windowStart = now - config.windowSeconds

			// Pipeline para atomicidade
			const pipeline = redis.pipeline()
			
			// Remove entradas antigas fora da janela
			pipeline.zremrangebyscore(key, 0, windowStart)
			
			// Adiciona requisição atual
			pipeline.zadd(key, now, `${now}:${Math.random()}`)
			
			// Conta requisições na janela
			pipeline.zcard(key)
			
			// Define expiração da chave
			pipeline.expire(key, config.windowSeconds)

			const results = await pipeline.exec()
			
			// O terceiro comando (zcard) retorna a contagem
			const requestCount = results?.[2]?.[1] as number || 0

			// Headers de rate limit
			c.header("X-RateLimit-Limit", String(config.maxRequests))
			c.header("X-RateLimit-Remaining", String(Math.max(0, config.maxRequests - requestCount)))
			c.header("X-RateLimit-Reset", String(now + config.windowSeconds))

			if (requestCount > config.maxRequests) {
				c.header("Retry-After", String(config.windowSeconds))
				return c.json(
					{ 
						error: "Too Many Requests", 
						message: config.message || "Rate limit exceeded" 
					},
					429
				)
			}

			return next()
		} catch (error) {
			// Em caso de erro, permite a requisição (fail-open)
			console.error("[RateLimit] Error:", error)
			return next()
		}
	}
}

/**
 * Rate limiter específico para autenticação
 */
export const authRateLimiter = rateLimiter(RATE_LIMIT_PRESETS.auth)

/**
 * Rate limiter para endpoints de API gerais
 */
export const apiRateLimiter = rateLimiter(RATE_LIMIT_PRESETS.api)

/**
 * Rate limiter para operações de escrita
 */
export const writeRateLimiter = rateLimiter(RATE_LIMIT_PRESETS.write)
