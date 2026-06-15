'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

const GameCardV = ({ game, index }) => {
	const { toggleBasket, toggleFavorite, isInBasket, isInFavorite } = useShop()
	const href = gameHref(game)
	const imageSrc = toPublicAsset(game.imgW || game.imgH)
	const discount =
		game.oldPrice > 0
			? Math.round(((game.oldPrice - game.newPrice) / game.oldPrice) * 100)
			: 0
	const itemMark =
		game.itemType === 'edition'
			? 'EDITION'
			: game.itemType === 'dlc' || game.dls || game.isDls
				? 'DLC'
				: ''
	const [narrow, setNarrow] = useState(false)

	useEffect(() => {
		const mq = () => setNarrow(window.innerWidth < 827)
		mq()
		window.addEventListener('resize', mq)
		return () => window.removeEventListener('resize', mq)
	}, [])

	const hidden = narrow && index === 4

	return (
		<article
			className={`gameV game_${game.id}`}
			data-game_id={game.id}
			style={hidden ? { display: 'none' } : undefined}
		>
			<Link href={href} className="gameV__banner">
				{imageSrc ? <img src={imageSrc} alt={game.name} /> : null}
				<div className="gameV__banner__info txt">
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
						<div className="gameH__banner__info__left" />
						<div className="gameH__banner__info__right">
							{itemMark ? (
								<div className="gameH__banner__info__point gameH__banner__info__point_more">{itemMark}</div>
							) : null}
							{game.oldPrice > 0 ? (
								<div className="gameH__banner__info__point gameH__banner__info__point_discount">{discount}%</div>
							) : null}
						</div>
					</div>
				</div>
			</Link>
			<div className="gameV__info">
				<div className="gameV__info__left">
					<div className="gameV__info__name txt">{game.name}</div>
				</div>
				<div className="gameV__info__right">
					<div className="gameV__info__price txt">{game.newPrice}₽</div>
					<div className="gameV__info__buttons">
						<button
							type="button"
							data-button="basket"
							data-game_id={game.id}
							className={`gameV__info__buttons__button _buttonBasket ${
								isInBasket(game.id) ? 'gameV__info__buttons__button_active' : ''
							}`}
							onClick={() => toggleBasket(game.id, game.name)}
						>
							<div className="gameV__info__buttons__button__forHover gameV__info__buttons__button__forHover_blue absolute-zero" />
							<img src="/img/icons/main/basket64.png" alt="" />
						</button>
						<button
							type="button"
							data-button="favorite"
							data-game_id={game.id}
							className={`gameV__info__buttons__button _buttonFavorite ${
								isInFavorite(game.id) ? 'gameV__info__buttons__button_active' : ''
							}`}
							onClick={() => toggleFavorite(game.id, game.name)}
						>
							<div className="gameV__info__buttons__button__forHover gameV__info__buttons__button__forHover_red absolute-zero" />
							<img src="/img/icons/main/like64.png" alt="" />
						</button>
					</div>
				</div>
			</div>
		</article>
	)
}

export default GameCardV
