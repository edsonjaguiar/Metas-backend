import type { Context, Next } from "hono"
import { auth } from "@/lib/auth"

export async function authMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401)
	}

	// Adiciona o usuário ao contexto
	c.set("user", session.user)
	c.set("session", session.session)

	await next()
}

// Tipo para o contexto com usuário autenticado
export type AuthContext = {
	Variables: {
		user: {
			id: string
			email: string
			name: string
			// adicione outros campos do seu usuário
		}
		session: {
			id: string
			expiresAt: Date
			// outros campos da sessão
		}
	}
}
