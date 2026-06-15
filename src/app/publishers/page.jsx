'use client'

import Link from 'next/link'
import { useShop } from '@/context/ShopContext'
import { toPublicAsset } from '@/lib/gameRoutes'

export default function PublishersPage() {
	const { publishers, loading } = useShop()
	return (
		<main id="main" className="inner inner_w1405p100">
			<section className="authors">
				<div className="authors__head">
					<h2 className="txt">Издатели</h2>
				</div>
				{loading ? <p className="txt shop-state">Загрузка...</p> : null}
				<div className="authors__grid">
					{publishers.map((item) => (
						<Link key={item.slug} href={`/publishers/${item.slug}`} className="authors__grid__author">
							<div className="authors__grid__author__logo">{item.logo ? <img src={toPublicAsset(item.logo)} alt="" /> : null}</div>
							<div className="authors__grid__author__info txt">
								<div className="authors__grid__author__info__title">{item.title}</div>
								<div className="authors__grid__author__info__count">{item.count_games || 0} Игр</div>
							</div>
						</Link>
					))}
				</div>
			</section>
		</main>
	)
}
