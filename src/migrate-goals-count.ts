import { db } from "./database/client"
import { users } from "./database/schema/users"
import { goalCompletions } from "./database/schema/goals-completions"
import { eq, sql } from "drizzle-orm"

/**
 * Script para migrar o contador de metas completadas para a nova coluna persistida.
 * Isso garante que usuários existentes não percam seu progresso visual após a mudança.
 */
/**
 * Script para migrar o contador de metas completadas para a nova coluna persistida.
 * Isso garante que usuários existentes não percam seu progresso visual após a mudança.
 */
export async function migrateGoalsCount() {
	console.log("🚀 Iniciando migração de contador de metas...")

	try {
		// Atualizar todos os usuários com o count real da tabela de completions
		const result = await db.execute(sql`
			UPDATE ${users}
			SET completed_goals = (
				SELECT count(*)
				FROM ${goalCompletions}
				WHERE ${goalCompletions.userId} = ${users.id}
			)
			RETURNING id, name, completed_goals
		`)

		console.log(`✅ Migração concluída! ${result.rowCount} usuários atualizados.`)
		
		return result.rows
	} catch (error) {
		console.error("❌ Falha na migração:", error)
		throw error
	}
}

// Executar se for chamado diretamente pelo CLI
const isMainFile = process.argv[1]?.endsWith('migrate-goals-count.ts') || process.argv[1]?.endsWith('migrate-goals-count.js');

if (isMainFile) {
    migrateGoalsCount()
        .then(() => {
            console.log("🏁 Processo finalizado com sucesso.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Erro no processo:", err);
            process.exit(1);
        });
}
