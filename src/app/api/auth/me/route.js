import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeUser } from '@/lib/strapiClient'

export async function GET() {
	const token = await readToken()
	if (!token) return jsonOk({ user: null })
	try {
		const profile = await strapiServerFetch('/api/store/me', { token })
		return jsonOk({ user: normalizeUser(profile.user || profile) })
	} catch (error) {
		return jsonError(error, 'Profile request failed')
	}
}
