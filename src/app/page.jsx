'use client'

import { useEffect, useState } from 'react'
import Carousel from '@/components/Carousel'
import GameCardH from '@/components/GameCard/GameCardH'
import GameCardV from '@/components/GameCard/GameCardV'
import { useShop } from '@/context/ShopContext'
import Link from 'next/link'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

function MidBanner({ game }) {
	const { toggleBasket, toggleFavorite, isInBasket, isInFavorite } = useShop()
	if (!game || !game.bigBanner) return null
	const href = gameHref(game)
	const h = game.bigBanner
	const v = game.banner_vert || game.imgW
	const bannerSrc = toPublicAsset(h)
	const mobileBannerSrc = toPublicAsset(v || h)
	const discount =
		game.oldPrice > 0
			? Math.round(((game.oldPrice - game.newPrice) / game.oldPrice) * 100)
			: 0

	return (
		<section className="banner">
			<h2 className="hidden">Баннер</h2>
			<article className="gameBanner" data-game_id={game.id}>
				<div className="carousel__banner__imgBlock">
					{bannerSrc ? <img src={bannerSrc} data-h={bannerSrc} data-v={mobileBannerSrc || bannerSrc} alt="" /> : null}
				</div>
				<Link href={href} className="gameBanner__link" style={{ display: 'block' }} />
				<div className="gameBanner__interaction">
					<div className="gameBanner__interaction__title txt">{game.name}</div>
					<div className="gameBanner__interaction__shopInfo">
						<div className="gameBanner__interaction__shopInfo__buttons">
							<button
								type="button"
								className={`gameBanner__interaction__shopInfo__buttons__button ${
									isInBasket(game.id) ? 'gameBanner__interaction__shopInfo__buttons__button_active' : ''
								}`}
								onClick={() => toggleBasket(game.id, game.name)}
							>
								<img src="/img/icons/main/basket32.png" alt="" />
							</button>
							<button
								type="button"
								className={`gameBanner__interaction__shopInfo__buttons__button ${
									isInFavorite(game.id) ? 'gameBanner__interaction__shopInfo__buttons__button_active' : ''
								}`}
								onClick={() => toggleFavorite(game.id, game.name)}
							>
								<img src="/img/icons/main/heart32.png" alt="" />
							</button>
						</div>
						<div className="gameBanner__interaction__shopInfo__priceTag">
							<div className="gameBanner__interaction__shopInfo__priceTag__prices">
								<div className="gameBanner__interaction__shopInfo__priceTag__prices__oldPrice txt">
									{game.oldPrice} ₽
								</div>
								<div className="gameBanner__interaction__shopInfo__priceTag__prices__newPrice txt">
									{game.newPrice} ₽
								</div>
							</div>
							<div className="gameBanner__interaction__shopInfo__priceTag__discount flex-center txt">{discount}%</div>
						</div>
					</div>
				</div>
			</article>
		</section>
	)
}

function uniqueGames(list) {
	const map = new Map()
	list.filter(Boolean).forEach((game) => {
		map.set(String(game.id), game)
	})
	return [...map.values()]
}

const Home = () => {
	const [minHeight, setMinHeight] = useState('auto')
	const { games, loading, apiError } = useShop()
	const salesHits = games.slice(0, 5)
	const newGames = uniqueGames(games.filter(({ status }) => status === 'new').concat(games.slice(5, 9))).slice(0, 8)
	const expectedGames = uniqueGames(
		games
			.filter(({ status, releaseDate }) => status === 'expected' || (releaseDate && new Date(releaseDate) > new Date()))
			.concat(games.slice(9, 13))
	).slice(0, 8)
	const ourChoiceGames = games.filter(({ status, isFeatured }) => status === 'ourChoice' || isFeatured).slice(0, 8)
	const bannerGame = games[3] || games[0]

	useEffect(() => {
		const upd = () => setMinHeight(`${window.innerHeight - 331}px`)
		upd()
		window.addEventListener('resize', upd)
		return () => window.removeEventListener('resize', upd)
	}, [])

	return (
		<main id="main" style={{ minHeight }}>
			<div className="inner inner_w1605p100">
				{loading ? <p className="txt shop-state">Загрузка магазина...</p> : null}
				{apiError ? <p className="txt shop-state shop-state_error">{apiError}</p> : null}
				{!loading && !apiError && games.length === 0 ? (
					<p className="txt shop-state">В каталоге пока нет игр. Заполните Strapi seed-данными.</p>
				) : null}
				<Carousel />

				<section className="salesHits" id="salesHits">
					<h2 className="hidden">Лидеры продаж</h2>
					<div className="heading">
						<h2 className="txt">Ожидаемое</h2>
						<button type="button" className="txt">
							<span>Показать еще</span>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
									fill="#fff"
								/>
							</svg>
						</button>
					</div>
					<div className="salesHits__games" id="salesHits_content">
						{salesHits.map((game, index) => (
							<GameCardV key={game.id} game={game} index={index} />
						))}
					</div>
				</section>

				<section className="games">
					<div className="heading">
						<h2 className="txt">Новинки</h2>
						<button type="button" className="txt">
							<span>Показать еще</span>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
									fill="#fff"
								/>
							</svg>
						</button>
					</div>
					<div className="games__grid griding_4InRow" id="offers_grid_new">
						{newGames.map((game) => (
							<GameCardH key={game.id} game={game} />
						))}
					</div>
					<MidBanner game={bannerGame} />
				</section>

				<section className="games">
					<div className="heading">
						<h2 className="txt">Ожидаемое</h2>
						<button type="button" className="txt">
							<span>Показать еще</span>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
									fill="#fff"
								/>
							</svg>
						</button>
					</div>
					<div className="games__grid griding_4InRow" id="offers_grid_expected">
						{expectedGames.map((game) => (
							<GameCardH key={game.id} game={game} />
						))}
					</div>
					<MidBanner game={games[2] || bannerGame} />
				</section>

				<section className="games">
					<div className="heading">
						<h2 className="txt">Наш выбор</h2>
						<button type="button" className="txt">
							<span>Показать еще</span>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
									fill="#fff"
								/>
							</svg>
						</button>
					</div>
					<div className="games__grid griding_4InRow" id="offers_grid_ourChoice">
						{ourChoiceGames.map((game) => (
							<GameCardH key={game.id} game={game} />
						))}
					</div>
				</section>
			</div>
		</main>
	)
}

export default Home
