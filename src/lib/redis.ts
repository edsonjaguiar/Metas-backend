import Redis from "ioredis"

// Singleton Redis client
let redis: Redis | null = null
let isConnected = false

export const getRedisClient = (): Redis => {
	if (!redis) {
		let redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
		
		// Upstash requer conexão segura (TLS)
		if (redisUrl.includes("upstash.io") && redisUrl.startsWith("redis://")) {
			console.log("🔒 Upgrading Upstash connection to TLS (rediss://)")
			redisUrl = redisUrl.replace("redis://", "rediss://")
		}
		
		console.log("🔄 Connecting to Redis...")

		redis = new Redis(redisUrl, {
			maxRetriesPerRequest: null, // Desabilitar limite para evitar crash em desconexão temporária
			family: 0,
			retryStrategy: (times) => {
				const delay = Math.min(times * 100, 3000)
				// Log apenas a cada 5 tentativas para não poluir
				if (times % 5 === 0) console.log(`⚠️  Redis retry attempt ${times}, waiting ${delay}ms`)
				return delay
			},
			lazyConnect: true,
			enableOfflineQueue: true, // Permitir queue offline para resiliência
			// Configurações específicas para TLS/Upstash
			tls: redisUrl.startsWith("rediss://") ? {
				rejectUnauthorized: false // Necessário para alguns provedores cloud
			} : undefined
		})

		redis.on("error", (err) => {
			console.error("❌ Redis Client Error:", err.message)
			isConnected = false
		})

		redis.on("connect", () => {
			console.log("✅ Redis connected successfully!")
			isConnected = true
		})
		
		redis.on("close", () => {
			console.log("⚠️  Redis connection closed")
			isConnected = false
		})

		// Conectar de forma assíncrona
		redis.connect().catch((err) => {
			console.error("❌ Failed to connect to Redis:", err.message)
			isConnected = false
		})
	}

	return redis
}

export const isRedisConnected = () => isConnected

// Helper para cache com TTL
export const cache = {
	/**
	 * Get value from cache
	 */
	async get<T>(key: string): Promise<T | null> {
		try {
			const client = getRedisClient()
			const value = await client.get(key)
			return value ? JSON.parse(value) : null
		} catch (error) {
			console.error(`Cache GET error for key ${key}:`, error)
			return null
		}
	},

	/**
	 * Set value in cache with TTL (in seconds)
	 */
	async set(key: string, value: unknown, ttl: number = 300): Promise<void> {
		try {
			const client = getRedisClient()
			await client.setex(key, ttl, JSON.stringify(value))
		} catch (error) {
			console.error(`Cache SET error for key ${key}:`, error)
		}
	},

	/**
	 * Delete key from cache
	 */
	async del(key: string): Promise<void> {
		try {
			const client = getRedisClient()
			await client.del(key)
		} catch (error) {
			console.error(`Cache DEL error for key ${key}:`, error)
		}
	},

	/**
	 * Delete multiple keys matching a pattern
	 */
	async delPattern(pattern: string): Promise<void> {
		try {
			const client = getRedisClient()
			const keys = await client.keys(pattern)
			if (keys.length > 0) {
				await client.del(...keys)
			}
		} catch (error) {
			console.error(`Cache DEL PATTERN error for ${pattern}:`, error)
		}
	},

	/**
	 * Wrapper para cache-aside pattern
	 */
	async getOrSet<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttl: number = 300
	): Promise<T> {
		// Tentar buscar do cache
		const cached = await this.get<T>(key)
		if (cached !== null) {
			return cached
		}

		// Se não encontrou, buscar da fonte
		const value = await fetcher()

		// Salvar no cache
		await this.set(key, value, ttl)

		return value
	},
}

// Cleanup ao encerrar
process.on("SIGINT", () => {
	if (redis) {
		redis.disconnect()
	}
})
