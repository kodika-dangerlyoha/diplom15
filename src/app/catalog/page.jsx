'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GameCardH from '@/components/GameCard/GameCardH'
import { useShop } from '@/context/ShopContext'

function getParam(searchParams, name) {
	return (searchParams.get(name) || '').trim()
}

function CatalogInner() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const {
		games,
		products,
		genres,
		platforms,
		developers,
		publishers,
		series,
		loading,
		apiError,
	} = useShop()
	const query = getParam(searchParams, 'q') || getParam(searchParams, 'title')

	const [form, setForm] = useState({
		genre: getParam(searchParams, 'genre'),
		platform: getParam(searchParams, 'platform'),
		developer: getParam(searchParams, 'developer'),
		publisher: getParam(searchParams, 'publisher'),
		series: getParam(searchParams, 'series'),
		productType: getParam(searchParams, 'productType') || 'all',
		discount: getParam(searchParams, 'discount'),
		minPrice: getParam(searchParams, 'minPrice'),
		maxPrice: getParam(searchParams, 'maxPrice'),
		sort: getParam(searchParams, 'sort') || 'title:asc',
	})

	const filtered = useMemo(() => {
		let list = form.productType === 'game' ? games : products
		const q = query.toLowerCase()
		if (q) list = list.filter((g) => g.name.toLowerCase().includes(q))
		if (form.productType && form.productType !== 'all' && form.productType !== 'game') {
			list = list.filter((g) => g.itemType === form.productType)
		}
		if (form.genre) list = list.filter((g) => g.genreSlugs?.includes(form.genre))
		if (form.platform) list = list.filter((g) => g.platformSlugs?.includes(form.platform))
		if (form.developer) list = list.filter((g) => g.developerSlug === form.developer)
		if (form.publisher) list = list.filter((g) => g.publisherSlug === form.publisher)
		if (form.series) list = list.filter((g) => g.seriesSlug === form.series)
		if (form.discount === 'true') list = list.filter((g) => g.isDiscounted || g.discountPercent > 0)
		if (form.minPrice) list = list.filter((g) => Number(g.newPrice) >= Number(form.minPrice))
		if (form.maxPrice) list = list.filter((g) => Number(g.newPrice) <= Number(form.maxPrice))

		const [field, dir] = form.sort.split(':')
		return [...list].sort((a, b) => {
			const sign = dir === 'desc' ? -1 : 1
			if (field === 'price') return (Number(a.newPrice) - Number(b.newPrice)) * sign
			if (field === 'releaseDate') return (new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0)) * sign
			if (field === 'rating') return (Number(a.rating || 0) - Number(b.rating || 0)) * sign
			if (field === 'discount') return (Number(a.discountPercent || 0) - Number(b.discountPercent || 0)) * sign
			return a.name.localeCompare(b.name, 'ru') * sign
		})
	}, [games, products, form, query])

	const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

	const applyFilters = (event) => {
		event.preventDefault()
		const params = new URLSearchParams()
		if (query) params.set('q', query)
		Object.entries(form).forEach(([key, value]) => {
			if (value) params.set(key, value)
		})
		router.push(`/catalog?${params.toString()}`)
	}

	const resetFilters = () => {
		setForm({
			genre: '',
			platform: '',
			developer: '',
			publisher: '',
			series: '',
			productType: 'all',
			discount: '',
			minPrice: '',
			maxPrice: '',
			sort: 'title:asc',
		})
		router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : '/catalog')
	}

	return (
		<main id="main" style={{ paddingBottom: 48 }}>
			<div className="inner inner_w1605p100">
				<form className="filters catalogFilters" onSubmit={applyFilters}>
					<div className="catalogFilters__top">
						<div className="catalogFilters__titleBlock">
							<h2 className="catalogFilters__title txt">Фильтры</h2>
						</div>
						<Link href="/pc-checker" className="catalogFilters__pcLink catalogFilters__pcLink_active txt">Подобрать игры</Link>
					</div>
					<div className="filters__row catalogFilters__row">
						<select className="def-input txt" value={form.sort} onChange={set('sort')}>
							<option value="title:asc">Название: А-Я</option>
							<option value="title:desc">Название: Я-А</option>
							<option value="price:asc">Цена: ниже</option>
							<option value="price:desc">Цена: выше</option>
							<option value="discount:desc">Скидка: выше</option>
							<option value="releaseDate:desc">Дата выхода: новые</option>
							<option value="rating:desc">Рейтинг: выше</option>
						</select>
						<select className="def-input txt" value={form.genre} onChange={set('genre')}>
							<option value="">Жанр</option>
							{genres.map((g) => (
								<option key={g.slug} value={g.slug}>{g.title}</option>
							))}
						</select>
						<select className="def-input txt" value={form.platform} onChange={set('platform')}>
							<option value="">Платформа</option>
							{platforms.map((p) => (
								<option key={p.slug} value={p.slug}>{p.title}</option>
							))}
						</select>
						<select className="def-input txt" value={form.developer} onChange={set('developer')}>
							<option value="">Разработчик</option>
							{developers.map((d) => (
								<option key={d.slug} value={d.slug}>{d.title}</option>
							))}
						</select>
						<select className="def-input txt" value={form.publisher} onChange={set('publisher')}>
							<option value="">Издатель</option>
							{publishers.map((p) => (
								<option key={p.slug} value={p.slug}>{p.title}</option>
							))}
						</select>
						<select className="def-input txt" value={form.series} onChange={set('series')}>
							<option value="">Серия</option>
							{series.map((s) => (
								<option key={s.slug} value={s.slug}>{s.title}</option>
							))}
						</select>
						<select className="def-input txt" value={form.productType} onChange={set('productType')}>
							<option value="all">Все товары</option>
							<option value="game">Игры</option>
							<option value="dlc">Дополнения</option>
							<option value="edition">Издания</option>
						</select>
						<select className="def-input txt" value={form.discount} onChange={set('discount')}>
							<option value="">Скидки</option>
							<option value="true">Только со скидкой</option>
						</select>
						<input className="def-input txt" type="number" min="0" value={form.minPrice} onChange={set('minPrice')} placeholder="Цена от" />
						<input className="def-input txt" type="number" min="0" value={form.maxPrice} onChange={set('maxPrice')} placeholder="Цена до" />
						<button className="catalogFilters__button txt" type="submit">Применить</button>
						<button className="catalogFilters__button catalogFilters__button_reset txt" type="button" onClick={resetFilters}>Сбросить</button>
					</div>
				</form>

				<h1 className="txt" style={{ marginBottom: 24 }}>
					Каталог{query ? ` - ${query}` : ''}
				</h1>
				{loading ? <p className="txt shop-state">Загрузка каталога...</p> : null}
				{apiError ? <p className="txt shop-state shop-state_error">{apiError}</p> : null}
				<div className="games__grid griding_4InRow">
					{filtered.map((game) => (
						<GameCardH key={game.id} game={game} />
					))}
				</div>
				{!loading && filtered.length === 0 ? <p className="txt shop-state">Ничего не найдено.</p> : null}
			</div>
		</main>
	)
}

export default function CatalogPage() {
	return (
		<Suspense fallback={<main className="inner txt">Загрузка каталога...</main>}>
			<CatalogInner />
		</Suspense>
	)
}
