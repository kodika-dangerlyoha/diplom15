'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

const MOBILE_MAX = 551

function resolveBannerImages(game) {
	const h = game.libraryHero || game.bigBanner || game.imgH || ''
	const v = game.banner_vert || game.libraryCapsule || game.imgW || game.imgH || h
	return { h, v }
}

const Carousel = () => {
	const { games, toggleBasket, toggleFavorite, isInBasket, isInFavorite } = useShop()
	const carouselBannerList = useMemo(
		() => games.filter((g) => g.carousel === true || g.isFeatured === true),
		[games]
	)

	const n = carouselBannerList.length
	const [activeIndex, setActiveIndex] = useState(0)
	const [isNarrow, setIsNarrow] = useState(false)
	const [animating, setAnimating] = useState(false)
	const animationTimerRef = useRef(null)

	useEffect(() => {
		const mq = () => setIsNarrow(window.innerWidth < MOBILE_MAX)
		mq()
		window.addEventListener('resize', mq)
		return () => window.removeEventListener('resize', mq)
	}, [])

	useEffect(() => {
		if (n === 0 && activeIndex !== 0) setActiveIndex(0)
		if (n > 0 && activeIndex > n - 1) setActiveIndex(n - 1)
	}, [activeIndex, n])

	useEffect(() => {
		return () => {
			if (animationTimerRef.current) clearTimeout(animationTimerRef.current)
		}
	}, [])

	const canSlide = n > 1
	const isFirst = activeIndex <= 0
	const isLast = activeIndex >= n - 1

	const slideTo = (nextIndex) => {
		if (!canSlide || animating || nextIndex < 0 || nextIndex > n - 1 || nextIndex === activeIndex) return
		setAnimating(true)
		setActiveIndex(nextIndex)
		if (animationTimerRef.current) clearTimeout(animationTimerRef.current)
		animationTimerRef.current = setTimeout(() => setAnimating(false), 505)
	}

	const scrollLeft = () => {
		slideTo(activeIndex - 1)
	}

	const scrollRight = () => {
		slideTo(activeIndex + 1)
	}

	const slideStyle = (index) => {
		const count = index - activeIndex
		const base = {
			transition: '0.5s',
			transitionTimingFunction: 'cubic-bezier(0, 0, 0, 0.75)',
			willChange: 'transform, opacity, z-index, margin-left',
		}
		if (count < 0) {
			return {
				...base,
				zIndex: n + 2,
				transform: 'scale(1.1) translateX(80%)',
				opacity: 0,
				visibility: 'hidden',
			}
		}
		if (isNarrow && count > 0) {
			return {
				...base,
				zIndex: 0,
				transform: 'scale(.9) translateX(0)',
				opacity: 0,
				visibility: 'hidden',
			}
		}
		return {
			...base,
			...(count === 0 ? { marginLeft: 0 } : {}),
			zIndex: n - count + 1,
			transform: `scale(${1 - count * 0.05})`,
			opacity: 1,
			visibility: 'visible',
		}
	}

	if (n === 0) {
		return null
	}

	return (
		<section className="carousel">
			<h2 className="hidden">Карусель</h2>
			<div className="carousel__buttons">
				<button
					type="button"
					title="Назад"
					className={`carousel__buttons__button${!canSlide || isFirst || animating ? ' carousel__buttons__button_disactive' : ''}`}
					onClick={scrollLeft}
					disabled={!canSlide || isFirst || animating}
					id="carousel_button_left"
				>
					<img src="/img/icons/main/arrRight32.png" alt="" />
				</button>
				<button
					type="button"
					title="Вперед"
					className={`carousel__buttons__button${!canSlide || isLast || animating ? ' carousel__buttons__button_disactive' : ''}`}
					onClick={scrollRight}
					disabled={!canSlide || isLast || animating}
					id="carousel_button_right"
				>
					<img src="/img/icons/main/arrRight32.png" alt="" />
				</button>
			</div>
			<div className="carousel__grid" id="grid_banners">
				{carouselBannerList.map((gameInfo, index) => {
					const count = index - activeIndex
					const { h, v } = resolveBannerImages(gameInfo)
					const imgSrc = isNarrow ? v : h
					const hasOld = gameInfo.oldPrice > 0
					const discount = hasOld
						? Math.round(
								((gameInfo.oldPrice - gameInfo.newPrice) / gameInfo.oldPrice) * 100
							)
						: 0
					const href = gameHref(gameInfo)
					const safeImgSrc = toPublicAsset(imgSrc)
					const safeH = toPublicAsset(h)
					const safeV = toPublicAsset(v)

					return (
						<article
							key={gameInfo.id}
							className="carousel__banner"
							data-game_id={gameInfo.id}
							data-order={count}
							style={slideStyle(index)}
						>
							<div className="carousel__banner__imgBlock">
								{safeImgSrc ? <img src={safeImgSrc} data-h={safeH || ''} data-v={safeV || ''} alt="" /> : null}
							</div>

							<a
								href={href}
								className="carousel__banner__link"
								style={{ display: count === 0 ? 'block' : 'none' }}
							/>

							<div className="carousel__banner__interaction">
								<div className="carousel__banner__interaction__title txt">
									{gameInfo.name}
								</div>

								<div className="carousel__banner__interaction__shopInfo">
									<div className="carousel__banner__interaction__shopInfo__buttons">
										<button
											type="button"
											data-button="basket"
											data-game_id={gameInfo.id}
											onClick={() => toggleBasket(gameInfo.id, gameInfo.name)}
											className={`carousel__banner__interaction__shopInfo__buttons__button ${
												isInBasket(gameInfo.id) ? 'carousel__banner__interaction__shopInfo__buttons__button_active' : ''
											}`}
										>
											<img src="/img/icons/main/basket32.png" alt="" />
										</button>

										<button
											type="button"
											data-button="favorite"
											data-game_id={gameInfo.id}
											onClick={() => toggleFavorite(gameInfo.id, gameInfo.name)}
											className={`carousel__banner__interaction__shopInfo__buttons__button ${
												isInFavorite(gameInfo.id) ? 'carousel__banner__interaction__shopInfo__buttons__button_active' : ''
											}`}
										>
											<img src="/img/icons/main/heart32.png" alt="" />
										</button>
									</div>

									<div className="carousel__banner__interaction__shopInfo__priceTag">
										<div className="carousel__banner__interaction__shopInfo__priceTag__prices">
											{hasOld && (
												<div className="carousel__banner__interaction__shopInfo__priceTag__prices__oldPrice txt">
													{gameInfo.oldPrice} ₽
												</div>
											)}
											<div className="carousel__banner__interaction__shopInfo__priceTag__prices__newPrice txt">
												{gameInfo.newPrice} ₽
											</div>
										</div>
										{hasOld && (
											<div className="carousel__banner__interaction__shopInfo__priceTag__discount flex-center txt">
												{discount}%
											</div>
										)}
									</div>
								</div>
							</div>
						</article>
					)
				})}
			</div>
		</section>
	)
}

export default Carousel
