import { jsonError, jsonOk, strapiServerFetch } from '@/lib/serverStrapi'

export async function POST(request) {
	try {
		const signature = request.headers.get('x-payment-signature') || ''
		const body = await request.json()
		const data = await strapiServerFetch('/api/payments/webhook', {
			method: 'POST',
			token: process.env.STRAPI_WEBHOOK_TOKEN || '',
			headers: {
				'x-payment-signature': signature,
			},
			body: JSON.stringify(body),
		})
		return jsonOk(data)
	} catch (error) {
		return jsonError(error, 'Payment webhook failed')
	}
}
