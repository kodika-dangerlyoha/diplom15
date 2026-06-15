import { clearToken, jsonOk } from '@/lib/serverStrapi'

export async function POST() {
	await clearToken()
	return jsonOk({ ok: true })
}
