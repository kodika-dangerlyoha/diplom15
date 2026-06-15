import { jsonError, jsonOk, readToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeOrder } from '@/lib/strapiClient'

export async function POST(request) {
	try {
		const token = await readToken()
		const body = await request.json().catch(() => ({}))
		const data = await strapiServerFetch('/api/payments/init', {
			method: 'POST',
			token,
			body: JSON.stringify({
				gameIds: body.gameIds || [],
				items: body.items || [],
				paymentProvider: body.paymentProvider,
			}),
		})
		return jsonOk({
			...data,
			order: normalizeOrder(data.order),
		})
	} catch (error) {
		return jsonError(error, 'Payment init failed')
	}
}
