'use client'

import Link from 'next/link'
import { useShop } from '@/context/ShopContext'
import { toPublicAsset } from '@/lib/gameRoutes'

function AuthorCard({ item, href }) {
	return (
		<Link href={href} className="authors__grid__author">
			<div className="authors__grid__author__logo">
				{item.logo || item.image ? <img src={toPublicAsset(item.logo || item.image)} alt="" crossOrigin="anonymous" /> : null}
			</div>
			<div className="authors__grid__author__info txt">
				<div className="authors__grid__author__info__title">{item.title}</div>
				<div className="authors__grid__author__info__count">{item.count_games || 0} Игр</div>
			</div>
		</Link>
	)
}

export default function AuthorsPage() {
	const { developers, publishers, loading, apiError } = useShop()
	return (
		<main id="main" className="inner inner_w1405p100">
			<section className="authors">
				<div className="authors__head">
					<h2 className="txt">Разработчики</h2>
					<div className="authors__head__right">
						<Link href="/publishers" className="txt">Издатели</Link>
					</div>
				</div>
				{loading ? <p className="txt shop-state">Загрузка...</p> : null}
				{apiError ? <p className="txt shop-state shop-state_error">{apiError}</p> : null}
				<div className="authors__grid" id="developers_grid">
					{developers.map((a) => (
						<AuthorCard key={a.slug} item={a} href={`/developers/${a.slug}`} />
					))}
				</div>
				<div className="authors__head" style={{ marginTop: 48 }}>
					<h2 className="txt">Издатели</h2>
				</div>
				<div className="authors__grid" id="publishers_grid">
					{publishers.map((a) => (
						<AuthorCard key={a.slug} item={a} href={`/publishers/${a.slug}`} />
					))}
				</div>
			</section>
		</main>
	)
}
