import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeOrder, normalizeUser } from '@/lib/strapiClient'

export async function POST(request) {
	try {
		const token = await readToken()
		const body = await request.json()
		const data = await strapiServerFetch('/api/payments/confirm', {
			method: 'POST',
			token,
			body: JSON.stringify({ orderId: body.orderId, paymentId: body.paymentId }),
		})
		return jsonOk({
			...data,
			order: normalizeOrder(data.order),
			user: normalizeUser(data.user),
		})
	} catch (error) {
		return jsonError(error, 'Payment confirm failed')
	}
}
