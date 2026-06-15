'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import EntityCatalogPage from '@/components/EntityCatalogPage'

export default function LegacyAuthorPage() {
	const params = useParams()
	const id = params?.id
	const { authors, games, loading } = useShop()
	const author = authors.find((a) => a.id === id || a.slug === id)
	const gamesList = useMemo(() => {
		if (!author) return []
		return games.filter((game) =>
			author.type === 'developer'
				? game.developerSlug === author.slug
				: game.publisherSlug === author.slug
		)
	}, [author, games])
	return (
		<EntityCatalogPage
			entity={author}
			games={gamesList}
			loading={loading}
			backHref="/authors"
			kind={author?.type || 'publisher'}
		/>
	)
}
