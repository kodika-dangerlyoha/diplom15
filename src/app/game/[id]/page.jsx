'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import GameCardH from '@/components/GameCard/GameCardH'
import { toPublicAsset } from '@/lib/gameRoutes'
import { sanitizeHtml, systemRequirementsToHtml } from '@/lib/systemRequirements'
import GameBannerPlayer from './GameBannerPlayer'
import './game-detail.css'

export default function GamePage() {
	const params = useParams()
	const id = String(params.id || '')
	const { games, findGame, toggleBasket, toggleFavorite, isInBasket, isInFavorite, loading } = useShop()
	const game = findGame(id)
	const [activeEdition, setActiveEdition] = useState(0)
	const [similarTab, setSimilarTab] = useState('similar')
	const categoriesRef = useRef(null)
	const [catShadow, setCatShadow] = useState('')

	const safeId = id

	const similarGames = useMemo(
		() => games.filter((g) => String(g.id) !== safeId && g.slug !== safeId).slice(0, 9),
		[games, safeId]
	)
	const smallDescription = useMemo(() => {
		const value = String(game?.small_description || '').replace(/\s+/g, ' ').trim()
		if (value.length <= 110) return value
		return `${value.slice(0, 107).trimEnd()}...`
	}, [game?.small_description])
	const seriesGames = useMemo(
		() =>
			game?.seriesSlug
				? games.filter((g) => String(g.id) !== safeId && g.seriesSlug === game.seriesSlug).slice(0, 9)
				: [],
		[games, safeId, game?.seriesSlug]
	)
	const gridGames = useMemo(() => {
		if (similarTab === 'similar') return similarGames
		return seriesGames.length > 0 ? seriesGames : similarGames
	}, [similarTab, similarGames, seriesGames])

	const updateCatShadow = useCallback(() => {
		const container = categoriesRef.current
		if (!container) return
		const links = container.querySelectorAll('.mainInfo__info__category__point')
		if (links.length === 0) {
			setCatShadow('')
			return
		}
		const rect = container.getBoundingClientRect()
		const left = links[0].getBoundingClientRect()
		const right = links[links.length - 1].getBoundingClientRect()
		const overflow = { right: right.right > rect.right, left: left.left < rect.left }
		if (overflow.right && overflow.left) setCatShadow('mainInfo__info__category_shadowAll')
		else if (overflow.right && !overflow.left) setCatShadow('mainInfo__info__category_shadowLeft')
		else if (!overflow.right && overflow.left) setCatShadow('mainInfo__info__category_shadowRight')
		else setCatShadow('')
	}, [])

	useEffect(() => {
		const container = categoriesRef.current
		if (!container || !game) return
		updateCatShadow()
		const onWheel = (e) => {
			e.preventDefault()
			container.scrollLeft += e.deltaY
			window.setTimeout(updateCatShadow, 80)
		}
		container.addEventListener('wheel', onWheel, { passive: false })
		const ro = new ResizeObserver(() => updateCatShadow())
		ro.observe(container)
		return () => {
			container.removeEventListener('wheel', onWheel)
			ro.disconnect()
		}
	}, [game, updateCatShadow])

	useEffect(() => {
		const block = document.querySelector('.topImgParalaxBlock')
		if (!block || !game) return
		const maxOpacity = 0.72
		let rafId = 0
		const getScrollTop = () =>
			Math.max(
				window.scrollY || 0,
				window.pageYOffset || 0,
				document.documentElement?.scrollTop || 0,
				document.body?.scrollTop || 0
			)
		const update = () => {
			const maxHeight = window.innerWidth < 720 ? 330 : 550
			const y = getScrollTop()
			block.style.height = `${maxHeight + y / 5}px`
			block.style.opacity = String(Math.max(0, maxOpacity - y / 400))
		}
		const scheduleUpdate = () => {
			if (rafId) cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(update)
		}
		update()
		window.addEventListener('scroll', scheduleUpdate, { passive: true })
		window.addEventListener('touchmove', scheduleUpdate, { passive: true })
		window.addEventListener('resize', scheduleUpdate)
		document.addEventListener('scroll', scheduleUpdate, true)
		document.body?.addEventListener('scroll', scheduleUpdate, { passive: true })
		return () => {
			if (rafId) cancelAnimationFrame(rafId)
			window.removeEventListener('scroll', scheduleUpdate)
			window.removeEventListener('touchmove', scheduleUpdate)
			window.removeEventListener('resize', scheduleUpdate)
			document.removeEventListener('scroll', scheduleUpdate, true)
			document.body?.removeEventListener('scroll', scheduleUpdate)
		}
	}, [game])

	if (!game && loading) {
		return (
			<main id="main" className="inner" style={{ padding: '4rem 1rem' }}>
				<h1 className="txt">Р—Р°РіСЂСѓР·РєР°...</h1>
			</main>
		)
	}

	if (!game) {
		return (
			<main id="main" className="inner" style={{ padding: '4rem 1rem' }}>
				<h1 className="txt">Игра не найдена</h1>
				<Link href="/" className="txt">
					На главную
				</Link>
			</main>
		)
	}

	const editions = game.editions || []
	const dlcList = game.dlc || []

	const descriptionHtml = sanitizeHtml(game.description || '')
	const sysHtml = systemRequirementsToHtml(game.systemRequirements)

	const hasEditions = editions.length > 0
	const hasDlc = dlcList.length > 0

	const discountPct =
		game.oldPrice > 0 ? Math.round(((game.oldPrice - game.newPrice) / game.oldPrice) * 100) : 0
	const steamPct = game.steamDiscountPct ?? discountPct
	const metaScore = game.metacritic ?? '4.7'

	const parallaxSrc = toPublicAsset(game.libraryHero || game.topImgParalaxBlockImage || game.bigBanner || game.imgH)
	const infoImageSrc = toPublicAsset(game.headerImageSrc || game.headerImage || game.header || game.imgH || game.imgW)
	const devHref = game.developerSlug ? `/developers/${game.developerSlug}` : ''
	const pubHref = game.publisherSlug ? `/publishers/${game.publisherSlug}` : ''
	const seriesHref = game.seriesSlug ? `/series/${game.seriesSlug}` : ''
	const inBasket = isInBasket(game.id)
	const inFavorite = isInFavorite(game.id)

	return (
		<main id="main" className="game-detail">
			<div className="topImgParalaxBlock" id="top_img_paralax_block">
				{parallaxSrc ? <img src={parallaxSrc} alt="" /> : null}
			</div>
			<div className="inner inner_w1220p150">
				<div className="mainInfo" id="main_info">
					<div className="mainInfo__left">
						<div className="mainInfo__title txt" id="game_title">
							{game.name}
						</div>
						<GameBannerPlayer game={game} steamPct={steamPct} metaScore={metaScore} />
						<div className="mainInfo__interaction">
							<div className="mainInfo__interaction__left">
								<button
									type="button"
									className={`mainInfo__interaction__button mainInfo__interaction__button_fav ${
										inFavorite ? 'mainInfo__interaction__button_active' : ''
									}`}
									title="В избранное"
									onClick={() => toggleFavorite(game.id, game.name)}
								>
									<img src="/img/icons/main/like64.png" alt="" />
								</button>
								<button
									type="button"
									className={`mainInfo__interaction__button mainInfo__interaction__button_basket ${
										inBasket ? 'mainInfo__interaction__button_active' : ''
									}`}
									title="В корзину"
									onClick={() => toggleBasket(game.id, game.name)}
								>
									<img src="/img/icons/main/basket64.png" alt="" />
								</button>
								<Link href="/basket" className="mainInfo__interaction__button mainInfo__interaction__button_buy txt" title="Купить">
									Купить
								</Link>
							</div>
							<div className="mainInfo__interaction__right">
								<div className="mainInfo__interaction__prices txt">
									<div className="mainInfo__interaction__prices__old">{game.oldPrice}₽</div>
									<div className="mainInfo__interaction__prices__new">
										<span id="region_price">
											<span>?</span>Ru
											<div className="txt">Регион аккаунта, на который покупается игра</div>
										</span>
										{game.newPrice}₽
									</div>
									</div>
								<div className="mainInfo__interaction__discount txt">{discountPct}%</div>
							</div>
						</div>
					</div>
					<div className="mainInfo__info" id="game_info">
						<div className="mainInfo__info__top">
							<div className="mainInfo__info__img">
								{infoImageSrc ? (
									<img src={infoImageSrc} alt="" id="game_img_right" />
								) : null}
							</div>
							{smallDescription ? (
								<div className="mainInfo__info__smallDescription txt" id="game_smallDescription">
									{smallDescription}
								</div>
							) : null}
						</div>
						<div className="mainInfo__info__bottom">
							<div
								ref={categoriesRef}
								className={`mainInfo__info__category ${catShadow}`.trim()}
								id="game_categories"
								data-scrolltype="shadow"
							>
								{(game.categories || []).map((c, catIdx) => {
									const categoryName = c?.name || c?.title || ''
									const categoryHref =
										typeof c?.link === 'string' && c.link
											? c.link
											: c?.slug
												? `/catalog?genre=${encodeURIComponent(c.slug)}`
												: ''
									if (!categoryName) return null
									return categoryHref ? (
										<Link
											key={`${game.id}-cat-${catIdx}-${categoryHref}-${categoryName}`}
											href={categoryHref}
											className="mainInfo__info__category__point txt"
										>
											{categoryName}
										</Link>
									) : (
										<span
											key={`${game.id}-cat-${catIdx}-${categoryName}`}
											className="mainInfo__info__category__point txt"
										>
											{categoryName}
										</span>
									)
								})}
							</div>
							<div className="mainInfo__info__about">
								<div className="mainInfo__info__about__point txt">
									<div className="mainInfo__info__about__point__key">Дата выхода:</div>
									<div className="mainInfo__info__about__point__value" id="game_date">
										{game.date || '—'}
									</div>
								</div>
								{seriesHref ? (
										<div className="mainInfo__info__about__point txt">
											<div className="mainInfo__info__about__point__key">Серия:</div>
											<Link
												href={seriesHref}
												className="mainInfo__info__about__point__value mainInfo__info__about__point__value_link txt"
											>
												{game.series}
											</Link>
										</div>
								) : null}
								<div className="mainInfo__info__about__point txt">
									<div className="mainInfo__info__about__point__key">Разработчик:</div>
									{devHref ? (
										<Link
											href={devHref}
											className="mainInfo__info__about__point__value mainInfo__info__about__point__value_link txt"
											id="game_developer"
										>
											{game.developer || '—'}
										</Link>
									) : (
										<span className="mainInfo__info__about__point__value txt" id="game_developer">
											{game.developer || '—'}
										</span>
									)}
								</div>
								<div className="mainInfo__info__about__point txt">
									<div className="mainInfo__info__about__point__key">Издатель:</div>
									{pubHref ? (
										<Link
											href={pubHref}
											className="mainInfo__info__about__point__value mainInfo__info__about__point__value_link txt"
											id="game_publisher"
										>
											{game.publisher || '—'}
										</Link>
									) : (
										<span className="mainInfo__info__about__point__value txt" id="game_publisher">
											{game.publisher || '—'}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{hasEditions || hasDlc ? (
					<section className="additions" id="additions">
						{hasDlc ? (
							<div
								className={`additions__side ${hasEditions ? 'additions__side_dlc' : ''}`}
								style={hasEditions ? undefined : { width: '100%' }}
								id="additions-dlc"
							>
								<div className="additions__side__header">
									<h3 className="txt">Дополнения</h3>
								</div>
								<div className="additions__side__grid additions__side__grid_dlc">
									{dlcList.map((d, dlcIdx) => (
										<div key={`${game.id}-dlc-${dlcIdx}-${d.id || d.title}`} className="dlc txt">
											<div className="dlc__title">{d.title}</div>
											<div className="dlc__right">
												<div className="dlc__right__prices">
													<div className="dlc__right__prices__old">{d.oldPrice} ₽</div>
													<div className="dlc__right__prices__new">{d.newPrice} ₽</div>
												</div>
												<div className="dlc__right__buttons">
													<button
														type="button"
														className={`dlc__right__buttons__button dlc__right__buttons__button_fav txt ${
															isInFavorite(d.id) ? 'dlc__right__buttons__button_active' : ''
														}`}
														title={isInFavorite(d.id) ? 'В избранном' : 'В избранное'}
														onClick={() => toggleFavorite(d, d.title)}
													>
														<img src="/img/icons/main/like64.png" alt="" />
													</button>
													<button
														type="button"
														className={`dlc__right__buttons__button dlc__right__buttons__button_buy txt ${
															isInBasket(d.id) ? 'dlc__right__buttons__button_active' : ''
														}`}
														onClick={() => toggleBasket(d, d.title)}
													>
														{isInBasket(d.id) ? 'В корзине' : 'Купить'}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}
						{hasEditions ? (
							<div
								className={`additions__side ${hasDlc ? 'additions__side_editions' : ''}`}
								style={hasDlc ? undefined : { width: '100%' }}
								id="additions-editions"
							>
								<div className="additions__side__header">
									<h3 className="txt">Издания</h3>
								</div>
								<div className="additions__side__grid additions__side__grid_editions">
									{editions.map((ed, i) => (
										<div
											key={`${game.id}-edition-${i}`}
											className={`edition ${i === activeEdition ? 'edition_active' : ''}`}
											onMouseEnter={() => setActiveEdition(i)}
											onFocus={() => setActiveEdition(i)}
											tabIndex={0}
										>
											<div className="edition__imgBlock">
												{toPublicAsset(ed.img || ed.image || ed.imgH) ? (
													<img src={toPublicAsset(ed.img || ed.image || ed.imgH)} alt={ed.title} />
												) : null}
												<div className="edition__imgBlock__mark txt">EDITION</div>
											</div>
											<div className="edition__info">
												<div className="edition__info__title txt">{ed.title}</div>
												<div className="edition__info__price txt">
													<span>{ed.newPrice} ₽</span>
													<div className="edition__info__price__percent">
														{ed.oldPrice > 0 ? Math.round(((ed.oldPrice - ed.newPrice) / ed.oldPrice) * 100) : 0}%
													</div>
												</div>
												<div className="edition__buttons">
													<button
														type="button"
														className={`edition__button edition__button_favorite txt ${
															isInFavorite(ed.id) ? 'edition__button_active' : ''
														}`}
														title={isInFavorite(ed.id) ? 'В избранном' : 'В избранное'}
														onClick={() => toggleFavorite(ed, ed.title)}
													>
														<img src="/img/icons/main/like64.png" alt="" />
													</button>
													<button
														type="button"
														className={`edition__button txt ${isInBasket(ed.id) ? 'edition__button_active' : ''}`}
														onClick={() => toggleBasket(ed, ed.title)}
													>
														{isInBasket(ed.id) ? 'В корзине' : 'В корзину'}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}
					</section>
				) : null}

				{descriptionHtml || sysHtml ? (
					<div className="information">
						{descriptionHtml ? (
							<div className="information__description information_block txt">
								<h2 className="txt">Описание</h2>
								<div id="description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
							</div>
						) : null}
						{sysHtml ? (
							<div className="information__rightColumn">
								<div className="information__rightColumn__systemRequirements information_block">
									<h2 className="txt">Системные требования</h2>
									<div id="systemRequirements" dangerouslySetInnerHTML={{ __html: sysHtml }} />
								</div>
							</div>
						) : null}
					</div>
				) : null}

				<section className="similar" id="switch_section-game">
					<div className="switch__head">
						<div
							className={`switch__head__point ${similarTab === 'similar' ? 'switch__head__point_active' : ''}`}
							id="switch_point-similar"
						>
							<button
								type="button"
								className="switch__head__point__click"
								data-section="similar"
								onClick={() => setSimilarTab('similar')}
								aria-pressed={similarTab === 'similar'}
							/>
							<div className="switch__head__point__text txt">Похожие</div>
						</div>
						<div
							className={`switch__head__point ${similarTab === 'series' ? 'switch__head__point_active' : ''}`}
							id="switch_point-series"
						>
							<button
								type="button"
								className="switch__head__point__click"
								data-section="series"
								onClick={() => setSimilarTab('series')}
								aria-pressed={similarTab === 'series'}
							/>
							<div className="switch__head__point__text txt">Игры серии</div>
						</div>
					</div>
					<div className="similar__grid switch__content similar__grid_active" id="switch_content-similar">
						{gridGames.map((g, si) => (
							<GameCardH key={`${similarTab}-${g.id}-${si}`} game={g} />
						))}
					</div>
				</section>
			</div>
		</main>
	)
}
