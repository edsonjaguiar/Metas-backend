import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary com as credenciais do ambiente
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Deleta uma imagem do Cloudinary usando seu public_id
 * @param publicId - O public_id da imagem no Cloudinary
 * @returns Promise<boolean> - true se deletou com sucesso, false caso contrário
 */
export async function deleteFromCloudinary(
	publicId: string,
): Promise<boolean> {
	try {
		const result = await cloudinary.uploader.destroy(publicId)
		
		if (result.result === "ok") {

			return true
		}
		
		console.warn(`⚠️ Falha ao deletar imagem da Cloudinary: ${publicId}`, result)
		return false
	} catch (error) {
		console.error(`❌ Erro ao deletar imagem da Cloudinary: ${publicId}`, error)
		return false
	}
}

/**
 * Extrai o public_id de uma URL do Cloudinary
 * Suporta formatos com ou sem versionamento, e com pastas
 */
export function extractPublicIdFromUrl(url: string): string | null {
	try {
		// Tentar encontrar o padrão de versão (v12345/) que é o divisor mais confiável
		// URLs do Cloudinary geralmente são: .../upload/{transformations}/v{version}/{public_id}.{ext}
		const versionRegex = /\/v\d+\/(.+)\.[a-zA-Z]+$/
		const versionMatch = url.match(versionRegex)

		if (versionMatch && versionMatch[1]) {
			return versionMatch[1]
		}

		// Fallback: Se não tiver versão, tentar pegar tudo após /upload/
		// Nota: Isso pode falhar se tiver transformações sem versão, mas é um caso raro no nosso setup
		const uploadRegex = /\/upload\/(?:[^/]+\/)*(?:v\d+\/)?(.+)\.[a-zA-Z]+$/
		const uploadMatch = url.match(uploadRegex)

		if (uploadMatch && uploadMatch[1]) {
			return uploadMatch[1]
		}
		
		return null
	} catch (error) {
		console.error("Erro ao extrair ID da URL:", error)
		return null
	}
}
