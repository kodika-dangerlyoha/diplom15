'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { getBootstrapData, normalizeUser } from '@/lib/strapiClient'
import {
	ensureShopKeys,
	readBasketIds,
	readFavoriteIds,
	readNotifications,
	writeBasketIds,
	writeFavoriteIds,
	writeNotifications,
} from '@/lib/shopStorage'

const ShopContext = createContext(null)

function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

function gameKey(value) {
	if (value && typeof value === 'object') {
		if (value.itemType && value.itemType !== 'game' && value.id) return String(value.id)
		return String(value.documentId || value.id || value.slug)
	}
	return String(value)
}

function shopItemTitle(value, fallback) {
	if (fallback) return fallback
	if (value && typeof value === 'object') return value.name || value.title || 'Игра'
	return 'Игра'
}

function stripItemPrefix(value) {
	return String(value || '').replace(/^(dlc|edition):/, '')
}

function shopItemAliases(value, productsById) {
	const keys = new Set()
	const key = gameKey(value)
	if (key) keys.add(String(key))
	if (key.includes(':')) keys.add(stripItemPrefix(key))

	const item =
		value && typeof value === 'object'
			? value
			: productsById.get(String(key)) || productsById.get(stripItemPrefix(key)) || null
	if (!item) return keys

	const itemType = item.itemType || item.type
	;[item.id, item.documentId, item.slug, item.numericId, item.productId]
		.filter(Boolean)
		.forEach((id) => {
			const stringId = String(id)
			keys.add(stringId)
			if (itemType && itemType !== 'game') keys.add(`${itemType}:${stripItemPrefix(stringId)}`)
		})

	return keys
}

function listHasShopItem(list, value, productsById) {
	const aliases = shopItemAliases(value, productsById)
	return (list || []).some((id) => aliases.has(String(id)))
}

function removeShopItemAliases(list, value, productsById) {
	const aliases = shopItemAliases(value, productsById)
	return (list || []).filter((id) => !aliases.has(String(id)))
}

function makeAuthor(item, type) {
	const slug = item.slug || item.id
	return {
		...item,
		id: `${type}:${slug}`,
		type,
		title: item.title || item.name,
		href: type === 'developer' ? `/developers/${slug}` : `/publishers/${slug}`,
	}
}

function topAuthors(list) {
	return [...list]
		.sort((a, b) => {
			const gamesDelta = Number(b.count_games || b.games?.length || 0) - Number(a.count_games || a.games?.length || 0)
			if (gamesDelta !== 0) return gamesDelta
			return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''), 'ru')
		})
		.slice(0, 10)
}

function mergeUniqueAuthors(developers, publishers) {
	return [
		...topAuthors(developers).map((item) => makeAuthor(item, 'developer')),
		...topAuthors(publishers).map((item) => makeAuthor(item, 'publisher')),
	]
}

export function ShopProvider({ children }) {
	const [games, setGames] = useState([])
	const [genres, setGenres] = useState([])
	const [tags, setTags] = useState([])
	const [platforms, setPlatforms] = useState([])
	const [developers, setDevelopers] = useState([])
	const [publishers, setPublishers] = useState([])
	const [series, setSeries] = useState([])
	const [basketIds, setBasketIds] = useState([])
	const [favoriteIds, setFavoriteIds] = useState([])
	const [storedNotifications, setStoredNotifications] = useState([])
	const [toasts, setToasts] = useState([])
	const [hydrated, setHydrated] = useState(false)
	const [loading, setLoading] = useState(true)
	const [apiError, setApiError] = useState('')
	const [user, setUser] = useState(null)
	const [authLoading, setAuthLoading] = useState(true)

	const gamesById = useMemo(() => {
		const map = new Map()
		games.forEach((game) => {
			;[game.id, game.documentId, game.slug, game.numericId].filter(Boolean).forEach((id) => {
				map.set(String(id), game)
			})
		})
		return map
	}, [games])

	const products = useMemo(() => {
		const list = []
		games.forEach((game) => {
			list.push(game)
			;(game.dlc || game.dlcs || []).forEach((item) => list.push(item))
			;(game.editions || []).forEach((item) => list.push(item))
		})
		return list
	}, [games])

	const productsById = useMemo(() => {
		const map = new Map()
		products.forEach((item) => {
			;[item.id, item.documentId, item.slug, item.numericId, item.productId].filter(Boolean).forEach((id) => {
				map.set(String(id), item)
				if (item.itemType && item.itemType !== 'game') {
					map.set(`${item.itemType}:${stripItemPrefix(id)}`, item)
				}
			})
		})
		return map
	}, [products])

	const replaceUserShopState = useCallback((nextUser) => {
		const normalized = normalizeUser(nextUser)
		setUser(normalized)
		if (!normalized) return
		const nextBasket = (normalized.cart || []).map(gameKey)
		const nextFavorite = (normalized.favoriteGames || []).map(gameKey)
		setBasketIds(nextBasket)
		setFavoriteIds(nextFavorite)
		writeBasketIds(nextBasket)
		writeFavoriteIds(nextFavorite)
	}, [])

	const refreshUser = useCallback(async () => {
		setAuthLoading(true)
		try {
			const res = await fetch('/api/auth/me', { cache: 'no-store' })
			const data = await res.json()
			if (res.ok && data.user) replaceUserShopState(data.user)
			if (res.ok && !data.user) setUser(null)
		} finally {
			setAuthLoading(false)
		}
	}, [replaceUserShopState])

	useEffect(() => {
		let mounted = true
		async function load() {
			ensureShopKeys()
			setBasketIds(readBasketIds())
			setFavoriteIds(readFavoriteIds())
			setStoredNotifications(readNotifications())
			setHydrated(true)
			try {
				const data = await getBootstrapData()
				if (!mounted) return
				setGames(data.games)
				setGenres(data.genres.map((g) => ({ ...g, id: g.slug || g.id })))
				setTags(data.tags.map((t) => ({ ...t, id: t.slug || t.id })))
				setPlatforms(data.platforms.map((p) => ({ ...p, id: p.slug || p.id })))
				setDevelopers(data.developers)
				setPublishers(data.publishers)
				setSeries(data.series)
				setApiError('')
			} catch (error) {
				if (mounted) setApiError(error.message || 'Не удалось загрузить данные Strapi')
			} finally {
				if (mounted) setLoading(false)
			}
		}
		load()
		refreshUser()
		return () => {
			mounted = false
		}
	}, [refreshUser])

	const findGame = useCallback(
		(idOrSlug) => gamesById.get(String(idOrSlug)) || null,
		[gamesById]
	)

	const basketGames = useMemo(
		() => basketIds.map((id) => productsById.get(String(id))).filter(Boolean),
		[basketIds, productsById]
	)

	const favoriteGames = useMemo(
		() => favoriteIds.map((id) => productsById.get(String(id))).filter(Boolean),
		[favoriteIds, productsById]
	)

	const basketTotal = useMemo(
		() => basketGames.reduce((s, g) => s + (Number(g.newPrice) || 0), 0),
		[basketGames]
	)

	const pushToast = useCallback((messageHtml, type = 'true') => {
		const id = generateId()
		setToasts((t) => [...t, { id, messageHtml, type }])
		window.setTimeout(() => {
			setToasts((t) => t.filter((x) => x.id !== id))
		}, 5000)
	}, [])

	const addStoredNotification = useCallback((messageHtml, ok) => {
		const nid = generateId()
		const status = ok ? 'addGame' : 'error'
		const row = { id: nid, status, message: messageHtml, viewed: false }
		setStoredNotifications((prev) => {
			const next = [row, ...prev]
			writeNotifications(next)
			return next
		})
	}, [])

	const notifyGameToggle = useCallback(
		(kind, has, title) => {
			const t = escapeHtml(title)
			const msgHtml =
				kind === 'basket'
					? has
						? `Игра <span>${t}</span> удалена из корзины`
						: `Игра <span>${t}</span> добавлена в корзину`
					: has
						? `Игра <span>${t}</span> удалена из избранного`
						: `Игра <span>${t}</span> добавлена в избранное`
			pushToast(msgHtml, 'true')
			addStoredNotification(msgHtml, true)
		},
		[pushToast, addStoredNotification]
	)

	const toggleServerState = useCallback(
		async (type, gameOrId) => {
			const gameId = gameKey(gameOrId)
			const item = typeof gameOrId === 'object' ? gameOrId : productsById.get(String(gameId)) || null
			const res = await fetch('/api/shop/toggle', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, gameId, item }),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) throw new Error(data.error || 'Не удалось сохранить состояние')
			if (data.user) replaceUserShopState(data.user)
			return data
		},
		[productsById, replaceUserShopState]
	)

	const toggleBasket = useCallback(
		async (gameOrId, gameTitle) => {
			const id = gameKey(gameOrId)
			const title = shopItemTitle(gameOrId, gameTitle)
			const has = listHasShopItem(basketIds, gameOrId, productsById)
			if (user) {
				try {
					await toggleServerState('cart', gameOrId)
					notifyGameToggle('basket', has, title)
					return
				} catch (error) {
					pushToast(escapeHtml(error.message), 'false')
					return
				}
			}
			const next = has ? removeShopItemAliases(basketIds, gameOrId, productsById) : [...basketIds, id]
			writeBasketIds(next)
			setBasketIds(next)
			notifyGameToggle('basket', has, title)
		},
		[basketIds, user, toggleServerState, notifyGameToggle, pushToast, productsById]
	)

	const toggleFavorite = useCallback(
		async (gameOrId, gameTitle) => {
			const id = gameKey(gameOrId)
			const title = shopItemTitle(gameOrId, gameTitle)
			const has = listHasShopItem(favoriteIds, gameOrId, productsById)
			if (user) {
				try {
					await toggleServerState('favorite', gameOrId)
					notifyGameToggle('favorite', has, title)
					return
				} catch (error) {
					pushToast(escapeHtml(error.message), 'false')
					return
				}
			}
			const next = has ? removeShopItemAliases(favoriteIds, gameOrId, productsById) : [...favoriteIds, id]
			writeFavoriteIds(next)
			setFavoriteIds(next)
			notifyGameToggle('favorite', has, title)
		},
		[favoriteIds, user, toggleServerState, notifyGameToggle, pushToast, productsById]
	)

	const isInBasket = useCallback(
		(gameId) => listHasShopItem(basketIds, gameId, productsById),
		[basketIds, productsById]
	)

	const isInFavorite = useCallback(
		(gameId) => listHasShopItem(favoriteIds, gameId, productsById),
		[favoriteIds, productsById]
	)

	const unviewedCount = useMemo(
		() => storedNotifications.filter((n) => !n.viewed).length,
		[storedNotifications]
	)

	const markNotificationViewed = useCallback((id) => {
		setStoredNotifications((prev) => {
			const next = prev.map((n) => (n.id === id ? { ...n, viewed: true } : n))
			writeNotifications(next)
			return next
		})
	}, [])

	const markAllNotificationsViewed = useCallback(() => {
		setStoredNotifications((prev) => {
			const next = prev.map((n) => (n.viewed ? n : { ...n, viewed: true }))
			writeNotifications(next)
			return next
		})
	}, [])

	const authors = useMemo(() => mergeUniqueAuthors(developers, publishers), [developers, publishers])

	const getGamesForCatalogCategory = useCallback(
		(category) => {
			if (!category) return games.slice(0, 5)
			if (String(category).includes(':')) {
				const [type, slug] = String(category).split(':')
				const byAuthor = games.filter((game) =>
					type === 'developer' ? game.developerSlug === slug : game.publisherSlug === slug
				)
				return (byAuthor.length ? byAuthor : games).slice(0, 5)
			}
			const g = games.filter((game) => game.genreSlugs?.includes(category))
			return (g.length ? g : games).slice(0, 5)
		},
		[games]
	)

	const login = useCallback(
		async ({ identifier, email, password }) => {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identifier: identifier || email, password }),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) throw new Error(data.error || 'Не удалось войти')
			replaceUserShopState(data.user)
			return data.user
		},
		[replaceUserShopState]
	)

	const register = useCallback(
		async ({ username, email, password }) => {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password }),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) throw new Error(data.error || 'Не удалось зарегистрироваться')
			replaceUserShopState(data.user)
			return data.user
		},
		[replaceUserShopState]
	)

	const logout = useCallback(async () => {
		await fetch('/api/auth/logout', { method: 'POST' })
		setUser(null)
		setBasketIds(readBasketIds())
		setFavoriteIds(readFavoriteIds())
	}, [])

	const updateProfile = useCallback(
		async (payload) => {
			const res = await fetch('/api/shop/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) throw new Error(data.error || 'Не удалось сохранить профиль')
			replaceUserShopState(data.user)
			return data.user
		},
		[replaceUserShopState]
	)

	const clearBasketState = useCallback(() => {
		setBasketIds([])
		writeBasketIds([])
		refreshUser()
	}, [refreshUser])

	const value = useMemo(
		() => ({
			hydrated,
			loading,
			apiError,
			user,
			authLoading,
			games,
			products,
			genres,
			tags,
			platforms,
			developers,
			publishers,
			series,
			authors,
			basketIds,
			favoriteIds,
			basketGames,
			favoriteGames,
			basketTotal,
			basketCount: basketGames.length,
			favoriteCount: favoriteGames.length,
			toggleBasket,
			toggleFavorite,
			isInBasket,
			isInFavorite,
			storedNotifications,
			unviewedCount,
			markNotificationViewed,
			markAllNotificationsViewed,
			toasts,
			getGamesForCatalogCategory,
			findGame,
			findProduct: (idOrSlug) => productsById.get(String(idOrSlug)) || null,
			login,
			register,
			logout,
			refreshUser,
			updateProfile,
			clearBasketState,
		}),
		[
			hydrated,
			loading,
			apiError,
			user,
			authLoading,
			games,
			products,
			genres,
			tags,
			platforms,
			developers,
			publishers,
			series,
			authors,
			basketIds,
			favoriteIds,
			basketGames,
			favoriteGames,
			basketTotal,
			toggleBasket,
			toggleFavorite,
			isInBasket,
			isInFavorite,
			storedNotifications,
			unviewedCount,
			markNotificationViewed,
			markAllNotificationsViewed,
			toasts,
			getGamesForCatalogCategory,
			findGame,
			productsById,
			login,
			register,
			logout,
			refreshUser,
			updateProfile,
			clearBasketState,
		]
	)

	return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
	const ctx = useContext(ShopContext)
	if (!ctx) throw new Error('useShop must be used within ShopProvider')
	return ctx
}
