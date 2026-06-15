'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import EntityCatalogPage from '@/components/EntityCatalogPage'

export default function PublisherPage() {
	const { slug } = useParams()
	const { publishers, games, loading } = useShop()
	const entity = publishers.find((p) => p.slug === slug)
	const entityGames = useMemo(() => games.filter((game) => game.publisherSlug === slug), [games, slug])
	return <EntityCatalogPage entity={entity} games={entityGames} loading={loading} backHref="/authors" kind="publisher" />
}
