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
			const fixedUrl = url.replace(
				"callbackURL=/",
				"callbackURL=/goals-dashboard",
			)

			console.error("URL corrigida:", fixedUrl)

			try {
				await sendVerificationEmail({
					userName: user.name,
					userEmail: user.email,
					verificationUrl: fixedUrl,
				})
				console.error("Email de verificação enviado para:", user.email)
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
		expiresIn: 60 * 60 * 24 * 7,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},

	...(isProduction && {
		secureCookies: true,
	}),

	advanced: {
		crossSubDomainCookies: {
			enabled: isProduction,
		},
	},

	plugins: [openAPI()],
})
