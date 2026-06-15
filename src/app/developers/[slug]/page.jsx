'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import EntityCatalogPage from '@/components/EntityCatalogPage'

export default function DeveloperPage() {
	const { slug } = useParams()
	const { developers, games, loading } = useShop()
	const entity = developers.find((d) => d.slug === slug)
	const entityGames = useMemo(() => games.filter((game) => game.developerSlug === slug), [games, slug])
	return <EntityCatalogPage entity={entity} games={entityGames} loading={loading} backHref="/authors" kind="developer" />
}
