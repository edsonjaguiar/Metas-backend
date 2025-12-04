// Polyfill para compatibilidade entre Bun e Node.js
// Este arquivo fornece as funções do Bun que usamos nos schemas

import { randomUUID } from "node:crypto"

// Bun usa randomUUIDv7, mas para compatibilidade usamos randomUUID do Node
export const randomUUIDv7 = randomUUID

// Exportar como default também para compatibilidade
export default {
	randomUUIDv7,
}
