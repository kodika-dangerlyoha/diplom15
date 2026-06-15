import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeOrder } from '@/lib/strapiClient'

export async function GET() {
	try {
		const token = await readToken()
		const data = await strapiServerFetch('/api/orders/me', { token })
		return jsonOk({ orders: (data.orders || []).map(normalizeOrder).filter(Boolean) })
	} catch (error) {
		return jsonError(error, 'Orders request failed')
	}
}
