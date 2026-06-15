'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import EntityCatalogPage from '@/components/EntityCatalogPage'

export default function SeriesPage() {
	const { slug } = useParams()
	const { series, games, loading } = useShop()
	const entity = series.find((s) => String(s.slug || s.id) === String(slug))
	const entityGames = useMemo(
		() =>
			games.filter((game) => {
				const seriesValue = game.seriesSlug || game.series?.slug || game.seriesId
				return String(seriesValue || '') === String(slug)
			}),
		[games, slug]
	)
	return <EntityCatalogPage entity={entity} games={entityGames} loading={loading} backHref="/catalog" kind="series" />
}
