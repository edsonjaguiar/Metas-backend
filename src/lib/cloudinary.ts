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
		// 1. Remover query strings (ex: ?t=123...)
		const baseUrl = url.split('?')[0]

		// 2. Tentar encontrar o padrão de versão (v12345/) que é o divisor mais confiável
		// URLs: .../upload/{transformations}/v{version}/{public_id}.{ext}
		const versionRegex = /\/v\d+\/(.+)\.[a-zA-Z]+$/
		const versionMatch = baseUrl.match(versionRegex)

		if (versionMatch && versionMatch[1]) {
			return versionMatch[1]
		}

		// 3. Fallback: Se não tiver versão, pegar tudo após o último par de barras que segue /upload/
		// O Cloudinary permite múltiplas transformações separadas por barra: /upload/c_crop,x_0/w_400/v1/id
		const parts = baseUrl.split('/upload/')
		if (parts.length < 2) return null

		// Pegar a parte após /upload/
		const afterUpload = parts[parts.length - 1]
		
		// O ID é o que vem depois da última barra (se houver v123/ ou transformações/)
		// e antes da extensão
		const segments = afterUpload.split('/')
		const lastSegment = segments[segments.length - 1]
		
		// Remover extensão
		const publicIdWithPossibleSubfolders = afterUpload.replace(/\.[a-zA-Z]+$/, '')
		
		// Se houver subpastas ou v123, precisamos ser cuidadosos.
		// No nosso caso simplificado, se não deu match no regex de versão, 
		// vamos tentar remover prefixos comuns de transformação conhecidos ou simplesmente pegar o último
		const result = publicIdWithPossibleSubfolders.split('/').filter(s => !s.includes('_') && !/^v\d+$/.test(s)).join('/')

		return result || lastSegment.split('.')[0]
	} catch (error) {
		console.error("Erro ao extrair ID da URL:", error)
		return null
	}
}
