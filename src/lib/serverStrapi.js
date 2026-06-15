import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { strapiUrl } from '@/lib/strapiClient'

export const AUTH_COOKIE = 'game_sale_jwt'

export async function readToken() {
	const store = await cookies()
	return store.get(AUTH_COOKIE)?.value || ''
}

export async function setToken(token) {
	const store = await cookies()
	const secureCookie = process.env.AUTH_COOKIE_SECURE === 'true'
	store.set(AUTH_COOKIE, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: secureCookie,
		path: '/',
		maxAge: 60 * 60 * 24 * 14,
	})
}

export async function clearToken() {
	const store = await cookies()
	store.delete(AUTH_COOKIE)
}

export async function strapiServerFetch(path, options = {}) {
	const token = options.token ?? (await readToken())
	const res = await fetch(strapiUrl(path), {
		...options,
		headers: {
			Accept: 'application/json',
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
		cache: 'no-store',
	})
	const data = await res.json().catch(() => null)
	if (!res.ok) {
		const message = data?.error?.message || data?.message || `Strapi request failed: ${res.status}`
		const err = new Error(message)
		err.status = res.status
		err.data = data
		throw err
	}
	return data
}

export function jsonOk(data, init) {
	return NextResponse.json(data, init)
}

export function jsonError(error, fallback = 'Request failed') {
	const status = error?.status || 500
	return NextResponse.json(
		{ error: error?.message || fallback, details: error?.data || null },
		{ status }
	)
}
