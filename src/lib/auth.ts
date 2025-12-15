import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { openAPI } from "better-auth/plugins"
import { db } from "@/database/client.js"
import { sendVerificationEmail } from "@/emails/email-service.js"
import { env } from "@/env.js"

const isProduction = env.NODE_ENV === "production"

export const auth = betterAuth({
	baseURL: isProduction
		? "https://metas-backend.onrender.com"
		: "http://localhost:3000",

	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),

	trustedOrigins: [
		isProduction ? "https://metas-frontend.vercel.app" : "http://localhost:5173",
	],

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		password: {
			hash: (password: string) => Bun.password.hash(password),
			verify: ({ password, hash }) => Bun.password.verify(password, hash),
		},
	},

	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			const frontendUrl = isProduction 
				? "https://metas-frontend.vercel.app" 
				: "http://localhost:5173"
				
			// Substituir a URL base do backend pela do frontend
			const backendUrl = isProduction
				? "https://metas-backend.onrender.com"
				: "http://localhost:3000"
				
			let fixedUrl = url.replace(backendUrl, frontendUrl)
			
			// Garantir callback correto
			fixedUrl = fixedUrl.replace(
				"callbackURL=/",
				"callbackURL=/goals-dashboard",
			)

			console.log("URL de verificação corrigida:", fixedUrl)

			try {
				await sendVerificationEmail({
					userName: user.name,
					userEmail: user.email,
					verificationUrl: fixedUrl,
				})
				console.log("Email de verificação enviado para:", user.email)
			} catch (error) {
				console.error("Erro ao enviar email:", error)
				throw error
			}
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600,
	},

	session: {
		// Sessão dura 30 dias
		expiresIn: 60 * 60 * 24 * 30,
		// Atualiza a sessão automaticamente antes de expirar
		updateAge: 60 * 60 * 24, // Atualiza a cada 24h de uso
		cookieCache: {
			enabled: true,
			// Cache dura 30 minutos (não 5 minutos)
			maxAge: 60 * 30,
		},
	},

	...(isProduction && {
		secureCookies: true,
	}),

	advanced: {
		crossSubDomainCookies: {
			enabled: false,
		},
		defaultCookieAttributes: {
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction,
			httpOnly: true,
		},
	},

	plugins: [openAPI()],
})
