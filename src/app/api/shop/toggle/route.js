import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeUser } from '@/lib/strapiClient'

export async function POST(request) {
	try {
		const token = await readToken()
		const body = await request.json()
		const data = await strapiServerFetch('/api/store/toggle', {
			method: 'POST',
			token,
			body: JSON.stringify({
				type: body.type,
				gameId: body.gameId,
				item: body.item,
			}),
		})
		return jsonOk({
			...data,
			user: normalizeUser(data.user),
		})
	} catch (error) {
		return jsonError(error, 'Shop state update failed')
	}
}
