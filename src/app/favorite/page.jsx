'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useShop } from '@/context/ShopContext'
import LineGameRow from '@/components/LineGameRow'
import HeaderBasketRow from '@/components/Header/HeaderBasketRow'

export default function FavoritePage() {
	const { favoriteGames, basketGames } = useShop()

	const basketTotals = useMemo(() => {
		let full = 0
		let total = 0
		basketGames.forEach((g) => {
			full += Number(g.oldPrice) || 0
			total += Number(g.newPrice) || 0
		})
		const discount = full > 0 ? Math.round(((full - total) / full) * 100) : 0
		return { full, total, discount }
	}, [basketGames])

	const emptyFavorite = favoriteGames.length === 0
	const emptyBasket = basketGames.length === 0

	return (
		<main id="main">
			<div className="inner inner_basket">
				<section className={`favorite ${emptyFavorite ? 'favorite_empty' : ''}`}>
					<div className="favorite__list">
						<h2 className="txt">Избранное</h2>
						<div className="lineGames" id="favorite_grid">
							{favoriteGames.map((game) => (
								<LineGameRow key={game.id} game={game} mode="favorite" />
							))}
						</div>
					</div>
					<div className="favorite__basket">
						<h2 className="txt">В корзине</h2>
						<div className={`favorite__basket__block ${emptyBasket ? 'favorite__basket__block_empty' : ''}`}>
							<div className="favorite__basket__block__fill">
								<div className="favorite__basket__block__games" id="basket">
									{basketGames.map((game) => (
										<HeaderBasketRow key={game.id} game={game} />
									))}
								</div>
								<div className="favorite__basket__block__info txt">
									<div className="favorite__basket__block__info__point">
										<div className="favorite__basket__block__info__point__key">Оффициальная цена</div>
										<div className="favorite__basket__block__info__point__value" id="full_price">
											{basketTotals.full} ₽
										</div>
									</div>
									<div className="favorite__basket__block__info__point">
										<div className="favorite__basket__block__info__point__key">Скидка</div>
										<div className="favorite__basket__block__info__point__value" id="discount">
											{basketTotals.discount}%
										</div>
									</div>
									<div className="favorite__basket__block__info__point favorite__basket__block__info__point_total">
										<div className="favorite__basket__block__info__point__key">Сумма к оплате</div>
										<div className="favorite__basket__block__info__point__value" id="total_price">
											{basketTotals.total} ₽
										</div>
									</div>
								</div>
								<Link href="/basket" className="favorite__basket__block__button txt">
									Перейти в корзину
								</Link>
							</div>
							<div className="favorite__basket__block__empty txt">
								<span>Вы еще не добавили ни одной игры в корзину</span>
							</div>
						</div>
					</div>
					<div className="favorite__empty txt">
						<span>Вы еще не добавили ни одну игру в избранное</span>
						<Link href="/">Перейти на главную страницу</Link>
					</div>
				</section>
			</div>
		</main>
	)
}
