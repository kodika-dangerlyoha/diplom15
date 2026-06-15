export function gameHref(game) {
	if (!game) return '/'
	if (game.itemType && game.itemType !== 'game' && game.parentGameSlug) {
		return `/game/${game.parentGameSlug}`
	}
	const { link, slug, id } = game
	if (link && link !== '' && !link.endsWith('.html')) return link
	return `/game/${slug || id}`
}

export function toPublicAsset(path) {
	if (!path || typeof path !== 'string') return null
	if (path.startsWith('http')) return path
	if (path.startsWith('/')) return path
	return `/${path}`
}
