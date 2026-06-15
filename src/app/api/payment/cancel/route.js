import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeOrder } from '@/lib/strapiClient'

export async function POST(request) {
	try {
		const token = await readToken()
		const body = await request.json()
		const data = await strapiServerFetch('/api/payments/cancel', {
			method: 'POST',
			token,
			body: JSON.stringify({ orderId: body.orderId, status: body.status || 'failed' }),
		})
		return jsonOk({ ...data, order: normalizeOrder(data.order) })
	} catch (error) {
		return jsonError(error, 'Payment cancel failed')
	}
}
