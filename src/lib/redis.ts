import Redis from "ioredis"

// Singleton Redis client
let redis: Redis | null = null

export const getRedisClient = (): Redis => {
	if (!redis) {
		const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

		redis = new Redis(redisUrl, {
			maxRetriesPerRequest: 3,
			retryStrategy: (times) => {
				const delay = Math.min(times * 50, 2000)
				return delay
			},
			lazyConnect: true,
		})

		redis.on("error", (err) => {
			console.error("Redis Client Error:", err)
		})

		redis.on("connect", () => {

		})

		// Conectar de forma assíncrona
		redis.connect().catch((err) => {
			console.error("Failed to connect to Redis:", err)
		})
	}

	return redis
}

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
