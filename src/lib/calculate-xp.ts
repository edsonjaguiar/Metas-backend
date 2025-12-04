/**
 * Calcula a recompensa de XP baseada na frequência semanal desejada
 * Quanto maior a frequência, maior o XP
 *
 * @param desiredWeeklyFrequency - Número de vezes por semana (1-7)
 * @returns XP reward value
 */
export function calculateXpReward(desiredWeeklyFrequency: number): number {
	const xpMap: Record<number, number> = {
		1: 10,
		2: 15,
		3: 20,
		4: 30,
		5: 35,
		6: 40,
		7: 50,
	}

	return xpMap[desiredWeeklyFrequency] ?? 10
}

/**
 * Calcula o XP necessário para alcançar o próximo nível
 * Usa uma progressão que aumenta gradualmente
 * 
 * @param currentLevel - Nível atual do usuário
 * @returns XP necessário para o próximo nível
 */
export function calculateXpForNextLevel(currentLevel: number): number {
	// Fórmula: 100 * level^1.5
	// Level 1->2: 100 XP
	// Level 2->3: 283 XP
	// Level 3->4: 520 XP
	// Level 4->5: 800 XP
	// Level 5->6: 1118 XP
	return Math.floor(100 * Math.pow(currentLevel, 1.5))
}
