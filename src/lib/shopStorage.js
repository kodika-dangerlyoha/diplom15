const LS_BASKET = 'basket'
const LS_FAVORITE = 'favorite'
const LS_NOTIFICATIONS = 'notifications'

export function readJsonArray(key) {
	if (typeof window === 'undefined') return []
	try {
		const raw = localStorage.getItem(key)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function writeJsonArray(key, value) {
	if (typeof window === 'undefined') return
	localStorage.setItem(key, JSON.stringify(value))
}

export function ensureShopKeys() {
	if (typeof window === 'undefined') return
	if (!localStorage.getItem(LS_NOTIFICATIONS)) localStorage.setItem(LS_NOTIFICATIONS, '[]')
	if (!localStorage.getItem(LS_BASKET)) localStorage.setItem(LS_BASKET, '[]')
	if (!localStorage.getItem(LS_FAVORITE)) localStorage.setItem(LS_FAVORITE, '[]')
}

export function readBasketIds() {
	return readJsonArray(LS_BASKET).map(String)
}

export function readFavoriteIds() {
	return readJsonArray(LS_FAVORITE).map(String)
}

export function readNotifications() {
	return readJsonArray(LS_NOTIFICATIONS)
}

export function writeBasketIds(ids) {
	writeJsonArray(LS_BASKET, ids.map(String))
}

export function writeFavoriteIds(ids) {
	writeJsonArray(LS_FAVORITE, ids.map(String))
}

export function writeNotifications(list) {
	writeJsonArray(LS_NOTIFICATIONS, list)
}

export { LS_BASKET, LS_FAVORITE, LS_NOTIFICATIONS }
