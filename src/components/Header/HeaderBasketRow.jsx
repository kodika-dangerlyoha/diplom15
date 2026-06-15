'use client'

import Link from 'next/link'
import { useShop } from '@/context/ShopContext'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

export default function HeaderBasketRow({ game }) {
	const { toggleBasket } = useShop()
	const steam = game.steamLink || game.steamUrl || ''

	return (
		<article className="header__basket__grid__game" data-game_id={game.id}>
			<div className="header__basket__grid__game__top">
				<Link href={gameHref(game)} className="header__basket__grid__game__title txt">
					{game.name}
				</Link>
				<button
					type="button"
					className="header__basket__grid__game__delete flex-center"
					title="Удалить"
					onClick={() => toggleBasket(game.id, game.name)}
				>
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M16 8L8 16M8.00001 8L16 16"
							stroke="#fff"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>
			<div className="header__basket__grid__game__bottom">
				<div className="header__basket__grid__game__prices txt">
					<div className="header__basket__grid__game__prices__new">{game.newPrice} ₽</div>
					<div className="header__basket__grid__game__prices__old">{game.oldPrice} ₽</div>
				</div>
				{steam ? <a href={steam} className="header__basket__grid__game__bottom__link txt" target="_blank" rel="noreferrer">
					<span>Игра в Steam</span>
					<svg
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
						x="0px"
						y="0px"
						viewBox="0 0 48 48"
						xmlSpace="preserve"
					>
						<path
							style={{ fill: 'none', strokeWidth: 4, strokeLinecap: 'round', strokeMiterlimit: 10 }}
							d="M22,10h-9.5 C9.468,10,7,12.468,7,15.5v20c0,3.032,2.468,5.5,5.5,5.5h20c3.032,0,5.5-2.468,5.5-5.5V26"
						/>
						<line
							style={{ fill: 'none', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 10 }}
							x1="24"
							y1="24"
							x2="41"
							y2="7"
						/>
						<polyline
							style={{ fill: 'none', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 10 }}
							points="28,7 41,7 41,20 "
						/>
					</svg>
				</a> : null}
			</div>
		</article>
	)
}
