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
