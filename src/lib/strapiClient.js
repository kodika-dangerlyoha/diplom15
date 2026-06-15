const DEFAULT_STRAPI_URL = 'http://localhost:1337'

export const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	DEFAULT_STRAPI_URL

const FULL_POPULATE =
	'populate[coverImage]=true&populate[headerImage]=true&populate[screenshots]=true&populate[topImgParalaxBlockImage]=true&populate[genres]=true&populate[tags]=true&populate[platforms]=true&populate[developer][populate]=logo&populate[publisher][populate]=logo&populate[series][populate]=image&populate[dlcs][populate][image]=true&populate[editions][populate][image]=true'

function cleanBaseUrl(url) {
	return String(url || DEFAULT_STRAPI_URL).replace(/\/+$/, '')
}

export function strapiUrl(path = '') {
	const base = cleanBaseUrl(STRAPI_URL)
	if (!path) return base
	return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function assetUrl(value) {
	const media = firstMedia(value)
	if (!media) return ''
	if (typeof media === 'string') return media.startsWith('http') ? media : strapiUrl(media)
	if (media.url) return String(media.url).startsWith('http') ? media.url : strapiUrl(media.url)
	return ''
}

function flattenEntity(entity) {
	if (!entity) return null
	if (entity.attributes) return { id: entity.id, documentId: entity.documentId, ...entity.attributes }
	return entity
}

function dataValue(value) {
	if (value && typeof value === 'object' && 'data' in value) return value.data
	return value
}

function relationArray(value) {
	const data = dataValue(value)
	if (!data) return []
	if (Array.isArray(data)) return data.map(flattenEntity).filter(Boolean)
	return [flattenEntity(data)].filter(Boolean)
}

function relationOne(value) {
	const data = dataValue(value)
	if (!data) return null
	if (Array.isArray(data)) return flattenEntity(data[0])
	return flattenEntity(data)
}

function firstMedia(value) {
	const data = dataValue(value)
	if (!data) return null
	if (Array.isArray(data)) return flattenEntity(data[0])
	return flattenEntity(data)
}

function mediaArray(value) {
	const data = dataValue(value)
	if (!data) return []
	if (Array.isArray(data)) return data.map(assetUrl).filter(Boolean)
	return [assetUrl(data)].filter(Boolean)
}

function assetOrString(...values) {
	for (const value of values) {
		if (typeof value === 'string' && value.trim()) return value.trim()
		const media = assetUrl(value)
		if (media) return media
	}
	return ''
}

function assetStringArray(...values) {
	for (const value of values) {
		const data = dataValue(value)
		if (!data) continue
		const list = Array.isArray(data) ? data : [data]
		const urls = list.map((item) => assetOrString(item)).filter(Boolean)
		if (urls.length) return urls
	}
	return []
}

function firstTrailerUrl(...values) {
	for (const value of values) {
		const data = dataValue(value)
		if (!data) continue
		const list = Array.isArray(data) ? data : [data]
		for (const item of list) {
			const raw = flattenEntity(item)
			const url = assetOrString(
				raw?.video,
				raw?.mp4,
				raw?.webm,
				raw?.src,
				raw?.url,
				raw?.trailerUrl,
				raw?.treiler_micro_mp4,
				item
			)
			if (url) return url
		}
	}
	return ''
}

function isMicroTrailerUrl(url) {
	return /microtrailer|\/small\/|\/treilers\/small\//i.test(String(url || ''))
}

function fullTrailerOrString(...values) {
	for (const value of values) {
		const url = assetOrString(value)
		if (url && !isMicroTrailerUrl(url)) return url
	}
	const trailerUrl = firstTrailerUrl(...values)
	return trailerUrl && !isMicroTrailerUrl(trailerUrl) ? trailerUrl : ''
}

function slugify(value) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9а-яё]+/giu, '-')
		.replace(/^-+|-+$/g, '')
}

function entityLabel(entity, fallback = '') {
	return entity?.title || entity?.name || fallback
}

function productId(raw, type) {
	const value = raw?.productId || raw?.id || raw?.documentId || raw?.slug || slugify(raw?.title || raw?.name)
	const id = String(value || `${type}-${Date.now()}`)
	if (type === 'game' || id.startsWith(`${type}:`)) return id
	return `${type}:${id}`
}

export function normalizeShopItem(item, type = 'game', parent = null) {
	const raw = flattenEntity(item)
	if (!raw) return null
	if (type === 'game' || raw.itemType === 'game') return normalizeGame(raw)

	const itemType = raw.itemType || raw.type || type
	const title = raw.title || raw.name || ''
	const slug = raw.slug || slugify(title || raw.documentId || raw.id)
	const price = Number(raw.price ?? raw.newPrice ?? 0)
	const oldPrice = Number(raw.oldPrice ?? 0)
	const discountPercent =
		Number(raw.discountPercent) ||
		(oldPrice > 0 && price < oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0)
	const parentGame = relationOne(raw.game)
	const parentGameSlug = raw.parentGameSlug || raw.gameSlug || parent?.slug || parentGame?.slug || ''
	const image = assetOrString(raw.image, raw.imageUrl, raw.img)
	const mainCapsule =
		assetOrString(
			raw.mainCapsule,
			raw.main_capsule,
			raw.mainCapsuleImage,
			raw.mainCapsuleUrl,
			raw.main_capsule_url,
			raw.imgH
		) ||
		parent?.imgH ||
		image
	const libraryCapsule =
		assetOrString(
			raw.libraryCapsule,
			raw.library_capsule,
			raw.libraryCapsuleImage,
			raw.libraryCapsuleUrl,
			raw.library_capsule_url,
			raw.imgW
		) ||
		image ||
		parent?.imgW ||
		mainCapsule

	return {
		...raw,
		id: productId(raw, itemType),
		productId: raw.productId || raw.documentId || raw.id || slug,
		numericId: raw.id,
		documentId: raw.documentId,
		itemType,
		type: itemType,
		name: title,
		title,
		slug,
		shortDescription: raw.shortDescription || raw.description || '',
		description: raw.description || '',
		price,
		newPrice: price,
		oldPrice,
		discountPercent,
		isDiscounted: raw.isDiscounted ?? discountPercent > 0,
		imgH: mainCapsule,
		imgW: libraryCapsule,
		image: image || libraryCapsule || mainCapsule,
		mainCapsule,
		libraryCapsule,
		headerImageSrc: parent?.headerImageSrc || mainCapsule,
		steamUrl: raw.steamUrl || parent?.steamUrl || '',
		steamLink: raw.steamUrl || parent?.steamUrl || '',
		parentGameSlug,
		parentGameTitle: raw.parentGameTitle || parent?.title || parent?.name || parentGame?.title || '',
		genreSlugs: raw.genreSlugs || parent?.genreSlugs || [],
		platformSlugs: raw.platformSlugs || parent?.platformSlugs || [],
		developerSlug: raw.developerSlug || parent?.developerSlug || '',
		publisherSlug: raw.publisherSlug || parent?.publisherSlug || '',
		seriesSlug: raw.seriesSlug || parent?.seriesSlug || '',
		rating: Number(raw.rating || parent?.rating || 0),
		link: raw.link || (parentGameSlug ? `/game/${parentGameSlug}` : ''),
	}
}

function compactDate(date) {
	if (!date) return ''
	const d = new Date(date)
	if (Number.isNaN(d.getTime())) return String(date)
	return d.toLocaleDateString('ru-RU')
}

export function normalizeTaxonomy(item) {
	const raw = flattenEntity(item)
	if (!raw) return null
	const title = raw.title || raw.name || ''
	const slug = raw.slug || slugify(title || raw.documentId || raw.id)
	return {
		...raw,
		id: raw.documentId || raw.id || slug,
		documentId: raw.documentId,
		title,
		name: raw.name || title,
		slug,
		logo: assetUrl(raw.logo || raw.image),
		image: assetUrl(raw.image || raw.logo),
		count_games: raw.games?.length || raw.games?.data?.length || 0,
	}
}

export function normalizeGame(item) {
	const raw = flattenEntity(item)
	if (!raw) return null

	const developer = relationOne(raw.developer)
	const publisher = relationOne(raw.publisher)
	const series = relationOne(raw.series)
	const genres = relationArray(raw.genres).map(normalizeTaxonomy).filter(Boolean)
	const tags = relationArray(raw.tags).map(normalizeTaxonomy).filter(Boolean)
	const platforms = relationArray(raw.platforms).map(normalizeTaxonomy).filter(Boolean)
	const title = raw.title || raw.name || ''
	const slug = raw.slug || slugify(title || raw.documentId || raw.id)
	const price = Number(raw.price ?? raw.newPrice ?? 0)
	const oldPrice = Number(raw.oldPrice ?? 0)
	const discountPercent =
		Number(raw.discountPercent) ||
		(oldPrice > 0 && price < oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0)
	const screenshots = assetStringArray(raw.screenshots, raw.Screenshots, raw.screenshotsUrls, raw.screenshotUrls)
	const trailerUrl = fullTrailerOrString(
		raw.trailerUrl,
		raw.treilerSrc,
		raw.trailerSrc,
		raw.trailers,
		raw.Trailers,
		raw.videos
	)
	const steamUrl = raw.steamUrl || raw.steamLink || ''
	const libraryHero =
		assetOrString(
			raw.libraryHero,
			raw.library_hero,
			raw.libraryHeroImage,
			raw.libraryHeroUrl,
			raw.library_hero_url,
			raw.topImgParalaxBlockImage,
			raw.topImgParalaxBlockImageUrl,
			raw.bigBanner
		)
	const mainCapsule =
		assetOrString(
			raw.mainCapsule,
			raw.main_capsule,
			raw.mainCapsuleImage,
			raw.mainCapsuleUrl,
			raw.main_capsule_url,
			raw.capsule616x353Url,
			raw.capsule_616x353,
			raw.imgH
		)
	const headerImageSrc =
		assetOrString(
			raw.headerImage,
			raw.headerImageUrl,
			raw.header,
			raw.headerUrl,
			raw.header_image,
			raw.img_header
		)
	const libraryCapsule =
		assetOrString(
			raw.libraryCapsule,
			raw.library_capsule,
			raw.libraryCapsuleImage,
			raw.libraryCapsuleUrl,
			raw.library_capsule_url,
			raw.coverImage,
			raw.coverImageUrl,
			raw.library_600x900,
			raw.imgW,
			raw.banner_vert
		)
	const imgH = mainCapsule || headerImageSrc || libraryHero || ''
	const imgW = libraryCapsule || mainCapsule || headerImageSrc || ''
	const bigBanner = libraryHero || headerImageSrc || imgH
	const microTrailerUrl = assetOrString(raw.microTrailerUrl, raw.treiler_micro_webm, raw.treiler_micro_mp4)
	const microTrailerIsWebm = /\.webm(?:$|[?#])/i.test(microTrailerUrl)
	const parentPreview = {
		slug,
		title,
		name: title,
		imgH,
		imgW,
		headerImageSrc,
		mainCapsule,
		libraryCapsule,
		libraryHero,
		steamUrl,
		genreSlugs: genres.map((g) => g.slug),
		platformSlugs: platforms.map((p) => p.slug),
		developerSlug: developer?.slug || slugify(entityLabel(developer, raw.developer || '')),
		publisherSlug: publisher?.slug || slugify(entityLabel(publisher, raw.publisher || '')),
		seriesSlug: series?.slug || slugify(entityLabel(series, raw.series || '')),
		rating: Number(raw.rating || raw.metacritic || 0),
	}
	const dlcItems = relationArray(raw.dlcs || raw.dlc)
		.map((item) => normalizeShopItem(item, 'dlc', parentPreview))
		.filter(Boolean)
	const editionItems = relationArray(raw.editions)
		.map((item) => normalizeShopItem(item, 'edition', parentPreview))
		.filter(Boolean)

	return {
		...raw,
		id: raw.documentId || raw.id || slug,
		numericId: raw.id,
		documentId: raw.documentId,
		itemType: 'game',
		type: 'game',
		slug,
		name: title,
		title,
		shortDescription: raw.shortDescription || raw.small_description || '',
		small_description: raw.shortDescription || raw.small_description || raw.description || '',
		description: raw.description || '',
		price,
		newPrice: price,
		oldPrice,
		discountPercent,
		isDiscounted: raw.isDiscounted ?? discountPercent > 0,
		isFeatured: raw.isFeatured ?? raw.carousel ?? false,
		carousel: raw.isFeatured ?? raw.carousel ?? false,
		releaseDate: raw.releaseDate,
		date: compactDate(raw.releaseDate || raw.date),
		steamUrl,
		steamLink: steamUrl,
		imgH,
		imgW,
		headerImageSrc,
		mainCapsule,
		libraryCapsule,
		libraryHero,
		bigBanner,
		topImgParalaxBlockImage: libraryHero || raw.topImgParalaxBlockImage || raw.bigBanner || '',
		banner_vert: assetOrString(raw.bannerVertUrl, raw.banner_vert) || imgW || raw.imgW || '',
		screenshots,
		trailers: trailerUrl
			? [
				{
					preview: screenshots[0] || headerImageSrc || imgH || '',
					video: trailerUrl,
				},
			]
			: Array.isArray(raw.trailers)
				? raw.trailers
				: [],
		trailerUrl,
		treiler_micro_mp4: microTrailerIsWebm ? '' : microTrailerUrl,
		treiler_micro_webm: microTrailerIsWebm ? microTrailerUrl : '',
		genres,
		genreSlugs: genres.map((g) => g.slug),
		tags,
		tagSlugs: tags.map((t) => t.slug),
		platforms,
		platformSlugs: platforms.map((p) => p.slug),
		categories: genres.map((g) => ({ name: g.title, link: `/catalog?genre=${g.slug}` })),
		developer: entityLabel(developer, raw.developer || ''),
		developerSlug: developer?.slug || slugify(entityLabel(developer, raw.developer || '')),
		developerEntity: developer ? normalizeTaxonomy(developer) : null,
		publisher: entityLabel(publisher, raw.publisher || ''),
		publisherSlug: publisher?.slug || slugify(entityLabel(publisher, raw.publisher || '')),
		publisherEntity: publisher ? normalizeTaxonomy(publisher) : null,
		series: entityLabel(series, raw.series || ''),
		seriesSlug: series?.slug || slugify(entityLabel(series, raw.series || '')),
		seriesEntity: series ? normalizeTaxonomy(series) : null,
		rating: Number(raw.rating || raw.metacritic || 0),
		systemRequirements: raw.systemRequirements || '',
		languageSupport: raw.languageSupport || '',
		dlc: dlcItems,
		dlcs: dlcItems,
		editions: editionItems,
	}
}

function normalizeStoredItems(value) {
	if (!Array.isArray(value)) return []
	return value
		.map((item) => normalizeShopItem(item, item?.itemType || item?.type || 'game'))
		.filter(Boolean)
}

function mergeShopItems(...groups) {
	const map = new Map()
	groups.flat().filter(Boolean).forEach((item) => {
		map.set(String(item.id), item)
	})
	return [...map.values()]
}

export function normalizeUser(rawUser) {
	const raw = flattenEntity(rawUser)
	if (!raw) return null
	const relationCart = relationArray(raw.cart || raw.basket).map(normalizeGame).filter(Boolean)
	const relationFavorites = relationArray(raw.favoriteGames || raw.favorites).map(normalizeGame).filter(Boolean)
	const cartItems = normalizeStoredItems(raw.cartItems)
	const favoriteItems = normalizeStoredItems(raw.favoriteItems)
	const library = relationArray(raw.library || raw.purchasedGames).map(normalizeGame).filter(Boolean)
	return {
		...raw,
		id: raw.id,
		username: raw.username || raw.nickname || '',
		nickname: raw.username || raw.nickname || '',
		email: raw.email || '',
		bio: raw.bio || '',
		steamTradeLink: raw.steamTradeLink || '',
		avatar: assetUrl(raw.avatar) || raw.avatarUrl || '',
		cart: mergeShopItems(cartItems, relationCart),
		cartItems: mergeShopItems(cartItems, relationCart),
		favoriteGames: mergeShopItems(favoriteItems, relationFavorites),
		favoriteItems: mergeShopItems(favoriteItems, relationFavorites),
		library,
		createdAt: raw.createdAt,
	}
}

export function normalizeOrder(item) {
	const raw = flattenEntity(item)
	if (!raw) return null
	const games = relationArray(raw.games).map(normalizeGame).filter(Boolean)
	const itemSnapshots = normalizeStoredItems(raw.items)
	const orderItems = mergeShopItems(itemSnapshots, games)
	return {
		...raw,
		id: raw.documentId || raw.id,
		documentId: raw.documentId,
		games: orderItems,
		items: orderItems,
		totalPrice: Number(raw.totalPrice || 0),
		status: raw.status || 'pending',
		paymentProvider: raw.paymentProvider || '',
		paymentId: raw.paymentId || '',
		createdAt: raw.createdAt,
	}
}

async function request(path, options = {}) {
	const res = await fetch(strapiUrl(path), {
		...options,
		headers: {
			Accept: 'application/json',
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(options.headers || {}),
		},
		cache: options.cache || 'no-store',
	})
	const data = await res.json().catch(() => null)
	if (!res.ok) {
		const message = data?.error?.message || data?.message || `Strapi request failed: ${res.status}`
		throw new Error(message)
	}
	return data
}

function collection(data, normalizer = (x) => x) {
	const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
	return list.map(normalizer).filter(Boolean)
}

export async function getGames(params = '') {
	const suffix = params ? `&${params}` : ''
	const data = await request(`/api/games?${FULL_POPULATE}${suffix}`)
	return collection(data, normalizeGame)
}

export async function getGameBySlug(slug) {
	const data = await request(
		`/api/games?${FULL_POPULATE}&filters[$or][0][slug][$eq]=${encodeURIComponent(slug)}&filters[$or][1][documentId][$eq]=${encodeURIComponent(slug)}&filters[$or][2][id][$eq]=${encodeURIComponent(slug)}`
	)
	return collection(data, normalizeGame)[0] || null
}

export async function getTaxonomy(resource, populate = '') {
	const data = await request(`/api/${resource}?${populate || 'populate=*'}`)
	return collection(data, normalizeTaxonomy)
}

export async function getEntityBySlug(resource, slug, normalizer = normalizeTaxonomy) {
	const data = await request(
		`/api/${resource}?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`
	)
	return collection(data, normalizer)[0] || null
}

export async function getBootstrapData() {
	const [games, genres, tags, platforms, developers, publishers, series] = await Promise.all([
		getGames('sort[0]=isFeatured:desc&sort[1]=createdAt:desc&pagination[pageSize]=100'),
		getTaxonomy('genres'),
		getTaxonomy('tags'),
		getTaxonomy('platforms'),
		getTaxonomy('developers', 'populate=logo'),
		getTaxonomy('publishers', 'populate=logo'),
		getTaxonomy('game-series', 'populate=image'),
	])
	return { games, genres, tags, platforms, developers, publishers, series }
}

export function entityGames(entity) {
	return relationArray(entity?.games).map(normalizeGame).filter(Boolean)
}

export { FULL_POPULATE }
