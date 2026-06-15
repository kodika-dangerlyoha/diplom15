import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeUser } from '@/lib/strapiClient'

export async function PUT(request) {
	try {
		const token = await readToken()
		const body = await request.json()
		const data = await strapiServerFetch('/api/store/profile', {
			method: 'PUT',
			token,
			body: JSON.stringify({
				username: body.username,
				steamTradeLink: body.steamTradeLink,
			}),
		})
		return jsonOk({ user: normalizeUser(data.user || data) })
	} catch (error) {
		return jsonError(error, 'Profile update failed')
	}
}
