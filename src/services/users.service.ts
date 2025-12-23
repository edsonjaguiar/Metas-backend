import { usersRepository } from "@/repositories/users.repository"
import { goalCompletionsRepository } from "@/repositories/goal-completions.repository"
import { cacheService } from "./cache.service"
import { deleteFromCloudinary } from "@/lib/cloudinary"
import type { UpdateProfileData, RankingResult } from "@/types"

/**
 * Users Service - Lógica de negócio para users
 */
export const usersService = {
	/**
	 * Buscar perfil do usuário com streak calculado
	 */
	async getProfile(userId: string) {
		return await cacheService.getCached(
			`user:v2:${userId}`,
			1800, // 30 minutos
			async () => {
				const user = await usersRepository.findById(userId)

				if (!user) {
					throw new Error("User not found")
				}

				// Calcular streak efetivo para exibição
				let currentStreak = user.currentStreak

				if (user.lastInteractionDate) {
					const now = new Date()
					const yesterday = new Date(now)
					yesterday.setDate(yesterday.getDate() - 1)
					yesterday.setHours(0, 0, 0, 0)

					const lastInteraction = new Date(user.lastInteractionDate)
					lastInteraction.setHours(0, 0, 0, 0)

					// Se a última interação foi antes de ontem (e não hoje), o streak quebrou
					if (
						lastInteraction.getTime() < yesterday.getTime() &&
						lastInteraction.toDateString() !== now.toDateString()
					) {
						currentStreak = 0
					}
				}

				return {
					...user,
					currentStreak,
				}
			},
		)
	},

	/**
	 * Atualizar perfil do usuário
	 */
	async updateProfile(userId: string, data: UpdateProfileData) {
		// Se está atualizando a imagem, tentar deletar a antiga
		if (data.image) {
			const currentUser = await usersRepository.findById(userId)

			if (currentUser) {
				// 1. Tentar usar o publicId guardado explicitamente no banco
				// 2. Fallback para extrair da URL antiga
				const imageToDelete = currentUser.cloudinaryPublicId || (currentUser.image ? (await import("@/lib/cloudinary")).extractPublicIdFromUrl(currentUser.image) : null)

				if (imageToDelete) {
					// Deletar imagem antiga da Cloudinary (não bloqueia se falhar)
					deleteFromCloudinary(imageToDelete).catch((err) => 
						console.error(`Falha ao deletar avatar antigo (${imageToDelete}):`, err)
					)
				}
			}
		}

		const updated = await usersRepository.updateProfile(userId, data)

		if (!updated) {
			throw new Error("User not found")
		}

		// Invalidar cache do usuário e ranking
		await Promise.all([
			cacheService.invalidateUserCaches(userId),
			cacheService.invalidateRankingCaches(), // Nome/Imagem mudou
		])

		return updated
	},

	/**
	 * Buscar ranking
	 */
	async getRanking(
		userId: string,
		category: "xp" | "level" | "streak" = "xp",
	): Promise<RankingResult> {
		return await cacheService.getCached(
			`ranking:v2:${category}`,
			1800, // 30 minutos
			async () => {
				// Buscar top 50
				const topUsers = await usersRepository.getRanking(category, 50)

				// Buscar posição do usuário atual
				const userRank = await usersRepository.getUserRank(userId, category)

				if (!userRank) {
					throw new Error("User not found in ranking")
				}

				// Contar total de usuários
				const totalUsers = await usersRepository.count()

				return {
					rankings: topUsers.map((user: any) => ({
						id: user.id,
						name: user.name,
						image: user.image,
						level: user.level,
						experience: user.experience,
						currentStreak: user.current_streak,
						completedGoals: Number(user.completed_goals),
						position: Number(user.position),
					})),
					currentUserPosition: Number(userRank.position),
					totalUsers,
				}
			},
		)
	},
}
