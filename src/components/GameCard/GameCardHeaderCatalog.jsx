'use client'

import Link from 'next/link'
import { useShop } from '@/context/ShopContext'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

export default function GameCardHeaderCatalog({ game }) {
	const { toggleBasket, toggleFavorite, isInBasket, isInFavorite } = useShop()
	const href = gameHref(game)
	const imageSrc = toPublicAsset(game.imgH || game.imgW)
	const preOrder =
		game.preOrder !== '' && game.preOrder != null ? (
			<div className="gameH__banner__info__point gameH__banner__info__point_more gameH__banner__info__point_preOrder">
				<span>Предзаказ</span>
				{game.preOrder}
			</div>
		) : null
	const itemMark =
		game.itemType === 'edition'
			? 'EDITION'
			: game.itemType === 'dlc' || game.dls || game.isDls
				? 'DLC'
				: ''
	const discount =
		game.oldPrice > 0
			? Math.round(((game.oldPrice - game.newPrice) / game.oldPrice) * 100)
			: 0

	return (
		<article className="gameH gameH_headerCatalog gameH_open" data-game_id={game.id}>
			<Link href={href} className="gameH__banner">
				<div className="gameH__banner__glass" />
				<div className="gameH__banner__imgBlock">
					{imageSrc ? <img src={imageSrc} alt={game.name} /> : null}
				</div>
				<div className="gameH__banner__videoBlock">
					{game.treiler_micro_mp4 || game.treiler_micro_webm ? (
						<video autoPlay loop muted playsInline>
							{game.treiler_micro_webm ? (
								<source src={game.treiler_micro_webm} type="video/webm" />
							) : null}
							{game.treiler_micro_mp4 ? (
								<source src={game.treiler_micro_mp4} type="video/mp4" />
							) : null}
						</video>
					) : null}
				</div>
				<div className="gameH__banner__info txt">
					<div className="gameH__banner__info__top">
						<div
							className={`gameH__banner__info__point gameH__banner__info__point_mark ${
								isInBasket(game.id) ? '' : 'gameH__banner__info__point_hidden'
							}`}
							data-mark="basket"
						>
							<img src="/img/icons/main/basket64.png" alt="" />
						</div>
						<div
							className={`gameH__banner__info__point gameH__banner__info__point_mark ${
								isInFavorite(game.id) ? '' : 'gameH__banner__info__point_hidden'
							}`}
							data-mark="favorite"
						>
							<img src="/img/icons/main/like64.png" alt="" />
						</div>
					</div>
					<div className="gameH__banner__info__bottom">
						<div className="gameH__banner__info__left">{preOrder}</div>
						<div className="gameH__banner__info__right">
							{itemMark ? (
								<div className="gameH__banner__info__point gameH__banner__info__point_more">{itemMark}</div>
							) : null}
							{game.oldPrice > 0 ? (
								<div className="gameH__banner__info__point gameH__banner__info__point_discount">
									{discount}%
								</div>
							) : null}
						</div>
					</div>
				</div>
			</Link>
			<div className="gameH__info">
				<div className="gameH__info__left">
					<div className="gameH__info__name txt">{game.name}</div>
				</div>
				<div className="gameH__info__right">
					<div className="gameH__info__price txt">{game.newPrice}₽</div>
					<div className="gameH__info__buttons">
						<button
							type="button"
							data-button="basket"
							data-game_id={game.id}
							className={`gameH__info__buttons__button _buttonBasket ${
								isInBasket(game.id) ? 'gameH__info__buttons__button_active' : ''
							}`}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								toggleBasket(game.id, game.name)
							}}
						>
							<div className="gameH__info__buttons__button__forHover gameH__info__buttons__button__forHover_blue absolute-zero" />
							<img src="/img/icons/main/basket64.png" alt="" />
						</button>
						<button
							type="button"
							data-button="favorite"
							data-game_id={game.id}
							className={`gameH__info__buttons__button _buttonFavorite ${
								isInFavorite(game.id) ? 'gameH__info__buttons__button_active' : ''
							}`}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								toggleFavorite(game.id, game.name)
							}}
						>
							<div className="gameH__info__buttons__button__forHover gameH__info__buttons__button__forHover_red absolute-zero" />
							<img src="/img/icons/main/like64.png" alt="" />
						</button>
					</div>
				</div>
			</div>
		</article>
	)
}
