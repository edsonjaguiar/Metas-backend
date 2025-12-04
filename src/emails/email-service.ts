import { readFile } from "node:fs/promises"
import { join } from "node:path"
import * as brevo from "@getbrevo/brevo"
import { env } from "@/env.js"

// Configurar cliente Brevo
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
	brevo.TransactionalEmailsApiApiKeys.apiKey,
	env.BREVO_API_KEY,
)

/**
 * Carrega template HTML e substitui variáveis
 */
async function loadTemplate(
	templateName: string,
	variables: Record<string, string>,
): Promise<string> {
	// A variável global __dirname funcionará corretamente aqui
	const templatePath = join(__dirname, `${templateName}.html`)


	let html = await readFile(templatePath, "utf-8")

	for (const [key, value] of Object.entries(variables)) {
		const regex = new RegExp(`{{${key}}}`, "g")
		html = html.replace(regex, value)
	}

	return html
}

/**
 * Envia email de verificação
 */
export async function sendVerificationEmail(data: {
	userName: string
	userEmail: string
	verificationUrl: string
}) {
	try {
		// Agora esta chamada vai carregar E personalizar o template
		const html = await loadTemplate("verify-email", {
			userName: data.userName,
			verificationUrl: data.verificationUrl,
		})

		const sendSmtpEmail = new brevo.SendSmtpEmail()
		sendSmtpEmail.sender = {
			email: "edsonaj09@gmail.com",
			name: "Metas App",
		}
		sendSmtpEmail.to = [{ email: data.userEmail, name: data.userName }]
		sendSmtpEmail.subject = "Verifique seu email"
		sendSmtpEmail.htmlContent = html

		const result = await apiInstance.sendTransacEmail(sendSmtpEmail)


		return result
	} catch (error) {
		console.error("Erro detalhado ao enviar email:", error)
		throw error
	}
}

/**
 * Envia email de alerta de streak prestes a expirar
 */
export async function sendStreakExpirationEmail(data: {
	userName: string
	userEmail: string
	currentStreak: number
	frontendUrl: string
}) {
	try {
		const sendSmtpEmail = new brevo.SendSmtpEmail()
		sendSmtpEmail.sender = {
			email: "edsonaj09@gmail.com",
			name: "Metas App",
		}
		sendSmtpEmail.to = [{ email: data.userEmail, name: data.userName }]
		sendSmtpEmail.subject = `🔥 Seu streak de ${data.currentStreak} dias está em risco!`
		sendSmtpEmail.htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #8b5cf6;">Olá, ${data.userName}!</h2>
				<p style="font-size: 16px;">Seu streak atual é de <strong style="color: #f97316;">${data.currentStreak} dias</strong>! 🔥</p>
				<p style="font-size: 16px;">Complete pelo menos uma meta hoje para manter sua sequência viva!</p>
				<p style="font-size: 16px;">Não deixe todo esse progresso ir embora! 💪</p>
				<br>
				<a href="${data.frontendUrl}/goals-dashboard" 
					 style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
					Ver Minhas Metas
				</a>
			</div>
		`

		await apiInstance.sendTransacEmail(sendSmtpEmail)

	} catch (error) {
		console.error(`❌ Erro ao enviar email de streak para ${data.userEmail}:`, error)
		throw error
	}
}

/**
 * Envia email de inatividade (usuário não completou metas há 2 dias)
 */
export async function sendInactivityEmail(data: {
	userName: string
	userEmail: string
	currentStreak: number
	frontendUrl: string
}) {
	try {
		const sendSmtpEmail = new brevo.SendSmtpEmail()
		sendSmtpEmail.sender = {
			email: "edsonaj09@gmail.com",
			name: "Metas App",
		}
		sendSmtpEmail.to = [{ email: data.userEmail, name: data.userName }]
		sendSmtpEmail.subject = `😢 ${data.userName}, você me abandonou...`
		sendSmtpEmail.htmlContent = `
			<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px;">
				<div style="background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
					<div style="font-size: 120px; margin: 0 0 20px 0;">😢</div>
					<h1 style="color: #1f2937; font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">${data.userName}...</h1>
					<p style="color: #6b7280; font-size: 18px; margin: 0 0 30px 0; font-weight: 500;">
						Você me deixou sozinho por <span style="color: #ef4444; font-weight: 800; font-size: 24px;">2 dias</span> 💔
					</p>
					<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #f59e0b;">
						<p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ ALERTA DE RISCO</p>
						<p style="margin: 0; color: #78350f; font-size: 16px;">
							Seu streak de <strong style="color: #f97316; font-size: 20px;">${data.currentStreak} dias</strong> está prestes a desaparecer...
						</p>
					</div>
					<a href="${data.frontendUrl}/goals-dashboard" 
						 style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 18px; margin: 20px 0;">
						💪 Sim, vou voltar agora!
					</a>
				</div>
			</div>
		`

		await apiInstance.sendTransacEmail(sendSmtpEmail)

	} catch (error) {
		console.error(`❌ Erro ao enviar email de inatividade para ${data.userEmail}:`, error)
		throw error
	}
}
