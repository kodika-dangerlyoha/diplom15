import { jsonError, jsonOk, setToken, strapiServerFetch } from '@/lib/serverStrapi'
import { normalizeUser } from '@/lib/strapiClient'

export async function POST(request) {
	try {
		const body = await request.json()
		const auth = await strapiServerFetch('/api/auth/local/register', {
			method: 'POST',
			token: '',
			body: JSON.stringify({
				username: body.username,
				email: body.email,
				password: body.password,
			}),
		})
		await setToken(auth.jwt)
		const profile = await strapiServerFetch('/api/store/me', { token: auth.jwt })
		return jsonOk({ user: normalizeUser(profile.user || profile), jwtStored: true })
	} catch (error) {
		return jsonError(error, 'Registration failed')
	}
}
