import { cache } from "@/lib/redis"

/**
 * Cache Service - Centraliza operações de cache
 */
export const cacheService = {
	/**
	 * Invalidar todos os caches relacionados a um usuário
	 */
	async invalidateUserCaches(userId: string): Promise<void> {
		await Promise.all([
			cache.del(`user:${userId}`),
			cache.delPattern(`progress:*:${userId}:*`),
			cache.del(`achievements:${userId}`),
		])
	},

	/**
	 * Invalidar caches de ranking
	 */
	async invalidateRankingCaches(): Promise<void> {
		await cache.delPattern("ranking:*")
	},

	/**
	 * Invalidar caches de progresso de um usuário
	 */
	async invalidateProgressCaches(userId: string): Promise<void> {
		await cache.delPattern(`progress:*:${userId}:*`)
	},

	/**
	 * Invalidar todos os caches relacionados a goals e gamificação
	 */
	async invalidateGoalCaches(userId: string): Promise<void> {
		await Promise.all([
			this.invalidateUserCaches(userId),
			this.invalidateRankingCaches(),
		])
	},

	/**
	 * Pattern cache-aside genérico
	 * Tenta buscar do cache, se não existir, executa a função e salva no cache
	 */
	async getCached<T>(
		key: string,
		ttl: number,
		fetchFn: () => Promise<T>,
	): Promise<T> {
		// Tentar buscar do cache
		const cached = await cache.get<T>(key)

		if (cached) {
			if (process.env.NODE_ENV !== "production") {

			}
			return cached
		}

		if (process.env.NODE_ENV !== "production") {

		}

		// Buscar dados
		const data = await fetchFn()

		// Salvar no cache
		await cache.set(key, data, ttl)

		return data
	},
}
