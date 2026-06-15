'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { toPublicAsset } from '@/lib/gameRoutes'
import GameCardHeaderCatalog from '@/components/GameCard/GameCardHeaderCatalog'
import HeaderBasketRow from '@/components/Header/HeaderBasketRow'

const HEADER_GENRE_LIMIT = 12
const HEADER_AUTHOR_LIMIT = 10

function getPageScrollTop() {
	if (typeof window === 'undefined') return 0
	return Math.max(
		window.scrollY || 0,
		window.pageYOffset || 0,
		document.documentElement?.scrollTop || 0,
		document.body?.scrollTop || 0
	)
}

const Header = () => {
	const pathname = usePathname()
	const router = useRouter()
	const searchRef = useRef(null)
	const mobileSearchMainRef = useRef(null)
	const mobileSearchFullRef = useRef(null)

	const [mobileSection, setMobileSection] = useState('main')

	const {
		genres,
		authors,
		basketGames,
		basketTotal,
		basketCount,
		favoriteCount,
		storedNotifications,
		unviewedCount,
		markNotificationViewed,
		toasts,
		getGamesForCatalogCategory,
	} = useShop()

	const [headerOpen, setHeaderOpen] = useState(false)
	const [headerBg, setHeaderBg] = useState(false)
	const [basketOpen, setBasketOpen] = useState(false)
	const [notificationOpen, setNotificationOpen] = useState(false)
	const [hoverCategory, setHoverCategory] = useState('shooter')
	const catalogHoverTimerRef = useRef(null)
	const catalogPendingIdRef = useRef(null)
	const visibleGenres = useMemo(() => genres.filter(Boolean).slice(0, HEADER_GENRE_LIMIT), [genres])
	const visibleAuthors = useMemo(() => authors.filter(Boolean).slice(0, HEADER_AUTHOR_LIMIT), [authors])

	const catalogGames = useMemo(
		() => getGamesForCatalogCategory(hoverCategory),
		[hoverCategory, getGamesForCatalogCategory]
	)

	const CATALOG_HOVER_MS = 601

	const onCatalogNavEnter = useCallback(
		(categoryId) => {
			catalogPendingIdRef.current = categoryId
			if (catalogHoverTimerRef.current) clearTimeout(catalogHoverTimerRef.current)
			catalogHoverTimerRef.current = setTimeout(() => {
				if (catalogPendingIdRef.current === categoryId) {
					setHoverCategory(categoryId)
				}
			}, CATALOG_HOVER_MS)
		},
		[]
	)

	const onCatalogNavLeave = useCallback(() => {
		catalogPendingIdRef.current = null
		if (catalogHoverTimerRef.current) {
			clearTimeout(catalogHoverTimerRef.current)
			catalogHoverTimerRef.current = null
		}
	}, [])

	const navigateFromCatalog = useCallback(
		(href) => {
			if (!href) return
			setHeaderOpen(false)
			router.push(href)
		},
		[router]
	)

	useEffect(() => {
		return () => {
			if (catalogHoverTimerRef.current) clearTimeout(catalogHoverTimerRef.current)
		}
	}, [])

	useEffect(() => {
		if (!visibleGenres.length && !visibleAuthors.length) return
		const currentExists =
			visibleGenres.some((genre) => genre.id === hoverCategory) ||
			visibleAuthors.some((author) => author.id === hoverCategory)
		if (!currentExists) setHoverCategory(visibleGenres[0]?.id || visibleAuthors[0]?.id)
	}, [hoverCategory, visibleAuthors, visibleGenres])

	useEffect(() => {
		function onScroll() {
			setHeaderBg(getPageScrollTop() > 0)
		}
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('touchmove', onScroll, { passive: true })
		document.addEventListener('scroll', onScroll, true)
		document.body?.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('touchmove', onScroll)
			document.removeEventListener('scroll', onScroll, true)
			document.body?.removeEventListener('scroll', onScroll)
		}
	}, [])

	useEffect(() => {
		if (!headerOpen) return
		const w = window.innerWidth - document.documentElement.clientWidth
		document.body.style.overflow = 'hidden'
		document.body.style.paddingRight = `${w}px`
		return () => {
			document.body.style.overflow = ''
			document.body.style.paddingRight = ''
		}
	}, [headerOpen])

	const closePanels = useCallback(() => {
		setBasketOpen(false)
		setNotificationOpen(false)
	}, [])

	const toggleCatalog = () => {
		if (headerOpen) {
			setHeaderOpen(false)
			if (getPageScrollTop() === 0) setHeaderBg(false)
		} else {
			closePanels()
			setMobileSection('main')
			setHeaderOpen(true)
			setHeaderBg(true)
		}
	}

	const toggleBasketPanel = () => {
		if (basketOpen) {
			setBasketOpen(false)
		} else {
			setNotificationOpen(false)
			setBasketOpen(true)
		}
	}

	const toggleNotificationPanel = () => {
		if (notificationOpen) {
			setNotificationOpen(false)
		} else {
			setBasketOpen(false)
			setNotificationOpen(true)
		}
	}

	const runSearch = () => {
		const v = searchRef.current?.value?.trim() || ''
		router.push(v ? `/catalog?q=${encodeURIComponent(v)}` : '/catalog')
	}

	const runMobileSearch = (inputRef) => {
		const v = inputRef.current?.value?.trim() || ''
		router.push(v ? `/catalog?q=${encodeURIComponent(v)}` : '/catalog')
		setMobileSection('main')
	}

	const favoriteActive = pathname === '/favorite'
	const profileActive = pathname === '/profile'
	const counterFavoriteClass =
		favoriteCount === 0 ? 'header__nav__button__counter header__nav__button__counter_hidden' : 'header__nav__button__counter'
	const counterNotifClass =
		unviewedCount === 0 ? 'header__nav__button__counter header__nav__button__counter_hidden' : 'header__nav__button__counter'

	return (
		<header className={`header ${headerOpen ? 'header_open' : ''}`}>
			<div
				className={`blackoutBlock fixed-zero ${headerOpen ? 'blackoutBlock_active' : ''}`}
				onClick={toggleCatalog}
			/>
			<div
				className={`header__bg ${headerBg ? 'header__bg_noTransparent' : ''} ${
					pathname === '/profile' ? 'header__bg_profile' : ''
				}`}
				id="header__bg"
			/>

			<div className="header__mobile">
				<div
					className={`header__mobile__main header__mobile__section ${
						mobileSection === 'main' ? 'header__mobile__section_open' : ''
					}`}
				>
					<div className="header__mobile__main__left">
						<Link href="/" className="header__logo" onClick={() => setMobileSection('main')}>
							<img src="/img/logos/+W(blue).svg" alt="+W Store" />
						</Link>
					</div>
					<div className="header__mobile__main__right">
						<button type="button" title="Каталог" className="header__nav__button header__mobileCatalogLink" onClick={() => router.push('/catalog')}>
							<svg viewBox="0 -0.5 21 21" xmlns="http://www.w3.org/2000/svg">
								<g fill="none" fillRule="evenodd">
									<g transform="translate(-139 -200)" fill="#fff">
										<g transform="translate(56 160)">
											<path d="M101.9,57.009 C101.9,57.56 101.38235,58 100.80275,58 L97.65275,58 C97.0742,58 96.65,57.56 96.65,57.009 L96.65,54.009 C96.65,53.458 97.0742,53 97.65275,53 L100.80275,53 C101.38235,53 101.9,53.458 101.9,54.009 L101.9,57.009 Z M100.80275,51 L97.65275,51 C95.9129,51 94.55,52.352 94.55,54.009 L94.55,57.009 C94.55,58.666 95.9129,60 97.65275,60 L100.80275,60 C102.5426,60 104,58.666 104,57.009 L104,54.009 C104,52.352 102.5426,51 100.80275,51 Z M90.35,57.009 C90.35,57.56 89.83235,58 89.25275,58 L86.10275,58 C85.5242,58 85.1,57.56 85.1,57.009 L85.1,54.009 C85.1,53.458 85.5242,53 86.10275,53 L89.25275,53 C89.83235,53 90.35,53.458 90.35,54.009 L90.35,57.009 Z M89.25275,51 L86.10275,51 C84.3629,51 83,52.352 83,54.009 L83,57.009 C83,58.666 84.3629,60 86.10275,60 L89.25275,60 C90.9926,60 92.45,58.666 92.45,57.009 L92.45,54.009 C92.45,52.352 90.9926,51 89.25275,51 Z" />
										</g>
									</g>
								</g>
							</svg>
						</button>
						<input
							ref={mobileSearchMainRef}
							type="text"
							title="Поиск"
							placeholder="Найти игру"
							onKeyDown={(e) => {
								if (e.key === 'Enter') runMobileSearch(mobileSearchMainRef)
							}}
						/>
						<button
							type="button"
							title="Поиск"
							className="header__nav__button"
							onClick={() => runMobileSearch(mobileSearchMainRef)}
						>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
									stroke="#fff"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
						<button
							type="button"
							title="Меню"
							className="header__nav__button"
							onClick={() => {
								closePanels()
								setMobileSection('navs')
							}}
						>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M4 18L20 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
								<path d="M4 12L20 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
								<path d="M4 6L20 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</button>
					</div>
				</div>
				<div
					className={`header__mobile__navs header__mobile__section ${
						mobileSection === 'navs' ? 'header__mobile__section_open' : ''
					}`}
				>
					<Link
						href="/profile"
						title="Профиль"
						className={`header__nav__button ${profileActive ? 'header__nav__button_active' : ''}`}
						onClick={() => setMobileSection('main')}
					>
						<img src="/img/icons/main/user64.png" alt="" />
					</Link>
					<Link
						href="/favorite"
						title="Избранное"
						className={`header__nav__button ${favoriteActive ? 'header__nav__button_active' : ''}`}
						onClick={() => setMobileSection('main')}
					>
						<img src="/img/icons/main/like64.png" alt="" />
						<div className={counterFavoriteClass}>
							<div className="header__nav__button__counter__number txt">
								{favoriteCount > 9 ? '9+' : favoriteCount}
							</div>
						</div>
					</Link>
					<button
						type="button"
						title="Уведомления"
						className={`header__nav__button ${notificationOpen ? 'header__nav__button_active' : ''}`}
						onClick={() => {
							setMobileSection('main')
							toggleNotificationPanel()
						}}
					>
						<img src="/img/icons/main/bell64.png" alt="" />
						<div className={counterNotifClass}>
							<div className="header__nav__button__counter__number txt">
								{unviewedCount > 9 ? '9+' : unviewedCount}
							</div>
						</div>
					</button>
					<button
						type="button"
						title="Корзина"
						className={`header__nav__buttonBasket ${basketCount === 0 ? 'header__nav__buttonBasket_closed' : ''} ${
							basketOpen ? 'header__nav__buttonBasket_active' : ''
						}`}
						onClick={() => {
							setMobileSection('main')
							toggleBasketPanel()
						}}
					>
						<img src="/img/icons/main/basket64.png" alt="" />
						<div className="header__nav__buttonBasket__info txt">
							<div className="header__nav__buttonBasket__info__value">{basketCount === 0 ? '0 ₽' : `${basketTotal} ₽`}</div>
							<div className="header__nav__buttonBasket__info__value">{basketCount} Игр</div>
						</div>
					</button>
					<button type="button" title="Закрыть" className="header__nav__button" onClick={() => setMobileSection('main')}>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16 8L8 16M8.00001 8L16 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
				<div
					className={`header__mobile__search header__mobile__section ${
						mobileSection === 'search' ? 'header__mobile__section_open' : ''
					}`}
				>
					<input
						ref={mobileSearchFullRef}
						type="text"
						title="Поиск"
						placeholder="Найти игру"
						onKeyDown={(e) => {
							if (e.key === 'Enter') runMobileSearch(mobileSearchFullRef)
						}}
					/>
					<button type="button" className="header__nav__button" title="Поиск" onClick={() => runMobileSearch(mobileSearchFullRef)}>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
								stroke="#fff"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button type="button" title="Закрыть" className="header__nav__button" onClick={() => setMobileSection('main')}>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16 8L8 16M8.00001 8L16 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
			</div>

			<div className="header__left">
				<Link href="/" className="header__logo">
					<img src="/img/logos/+WStore.svg" alt="+W Store" />
				</Link>
			</div>

			<div className="header__center" id="centerHeader_gameCard">
				<button
					type="button"
					title="Каталог"
					className={`header__buttonCatalog ${headerOpen ? 'header__buttonCatalog_active' : ''}`}
					onClick={toggleCatalog}
				>
					<svg viewBox="0 -0.5 21 21" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
						<g fill="none" fillRule="evenodd">
							<g transform="translate(-139 -200)" fill="#fff">
								<g transform="translate(56 160)">
									<path d="M101.9,57.009 C101.9,57.56 101.38235,58 100.80275,58 L97.65275,58 C97.0742,58 96.65,57.56 96.65,57.009 L96.65,54.009 C96.65,53.458 97.0742,53 97.65275,53 L100.80275,53 C101.38235,53 101.9,53.458 101.9,54.009 L101.9,57.009 Z M100.80275,51 L97.65275,51 C95.9129,51 94.55,52.352 94.55,54.009 L94.55,57.009 C94.55,58.666 95.9129,60 97.65275,60 L100.80275,60 C102.5426,60 104,58.666 104,57.009 L104,54.009 C104,52.352 102.5426,51 100.80275,51 L100.80275,51 Z M90.35,57.009 C90.35,57.56 89.83235,58 89.25275,58 L86.10275,58 C85.5242,58 85.1,57.56 85.1,57.009 L85.1,54.009 C85.1,53.458 85.5242,53 86.10275,53 L89.25275,53 C89.83235,53 90.35,53.458 90.35,54.009 L90.35,57.009 Z M89.25275,51 L86.10275,51 C84.3629,51 83,52.352 83,54.009 L83,57.009 C83,58.666 84.3629,60 86.10275,60 L89.25275,60 C90.9926,60 92.45,58.666 92.45,57.009 L92.45,54.009 C92.45,52.352 90.9926,51 89.25275,51 L89.25275,51 Z M101.9,46.009 C101.9,46.56 101.38235,47 100.80275,47 L97.65275,47 C97.0742,47 96.65,46.56 96.65,46.009 L96.65,43.009 C96.65,42.458 97.0742,42 97.65275,42 L100.80275,42 C101.38235,42 101.9,42.458 101.9,43.009 L101.9,46.009 Z M100.80275,40 L97.65275,40 C95.9129,40 94.55,41.352 94.55,43.009 L94.55,46.009 C94.55,47.666 95.9129,49 97.65275,49 L100.80275,49 C102.5426,49 104,47.666 104,46.009 L104,43.009 C104,41.352 102.5426,40 100.80275,40 L100.80275,40 Z M90.35,46.009 C90.35,46.56 89.83235,47 89.25275,47 L86.10275,47 C85.5242,47 85.1,46.56 85.1,46.009 L85.1,43.009 C85.1,42.458 85.5242,42 86.10275,42 L89.25275,42 C89.83235,42 90.35,42.458 90.35,43.009 L90.35,46.009 Z M89.25275,40 L86.10275,40 C84.3629,40 83,41.352 83,43.009 L83,46.009 C83,47.666 84.3629,49 86.10275,49 L89.25275,49 C90.9926,49 92.45,47.666 92.45,46.009 L92.45,43.009 C92.45,41.352 90.9926,40 89.25275,40 L89.25275,40 Z" />
								</g>
							</g>
						</g>
					</svg>
				</button>
				<div className="header__searchBlock">
					<input
						ref={searchRef}
						type="text"
						title="Поиск"
						id="search-input"
						placeholder="Найти игру"
						onKeyDown={(e) => {
							if (e.key === 'Enter') runSearch()
						}}
					/>
					<button className="header__searchBlock__button" title="Поиск" type="button" id="search-button" onClick={runSearch}>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
								stroke="#fff"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>

			<div className="header__right">
				<nav className="header__nav">
					<Link href="/profile" title="Профиль" className={`header__nav__button ${profileActive ? 'header__nav__button_active' : ''}`}>
						<img src="/img/icons/main/user64.png" alt="" />
					</Link>
					<Link
						href="/favorite"
						title="Избранное"
						className={`header__nav__button ${favoriteActive ? 'header__nav__button_active' : ''}`}
						id="header_favorite_button"
					>
						<img src="/img/icons/main/like64.png" alt="" />
						<div className={counterFavoriteClass} id="header_favorite_counter">
							<div className="header__nav__button__counter__number txt">
								{favoriteCount > 9 ? '9+' : favoriteCount}
							</div>
						</div>
					</Link>
					<button
						type="button"
						title="Уведомления"
						className={`header__nav__button ${notificationOpen ? 'header__nav__button_active' : ''}`}
						id="header_button_notification"
						onClick={toggleNotificationPanel}
					>
						<img src="/img/icons/main/bell64.png" alt="" />
						<div className={counterNotifClass} id="header_notification_counter">
							<div className="header__nav__button__counter__number txt">
								{unviewedCount > 9 ? '9+' : unviewedCount}
							</div>
						</div>
					</button>
					<button
						type="button"
						title="Корзина"
						className={`header__nav__buttonBasket ${basketCount === 0 ? 'header__nav__buttonBasket_closed' : ''} ${
							basketOpen ? 'header__nav__buttonBasket_active' : ''
						}`}
						id="header_basket_button"
						onClick={toggleBasketPanel}
					>
						<img src="/img/icons/main/basket64.png" alt="" />
						<div className="header__nav__buttonBasket__info txt">
							<div className="header__nav__buttonBasket__info__value" id="header_basket_price">
								{basketCount === 0 ? '0 ₽' : `${basketTotal} ₽`}
							</div>
							<div className="header__nav__buttonBasket__info__value" id="header_basket_counter">
								{basketCount} Игр
							</div>
						</div>
					</button>
				</nav>
			</div>

			<div className={`header__catalog ${headerOpen ? 'header__catalog_open' : ''}`}>
				<div className="inner inner_main">
					<div className="header__catalog__navs">
						<div className="header__catalog__navs__genres">
							<div className="header__catalog__head txt">
								<div className="header__catalog__head__title">Жанры</div>
								<Link href="/catalog" className="header__catalog__head__more txt" onClick={() => setHeaderOpen(false)}>
									Показать все
								</Link>
							</div>
							<div className="header__catalog__navs__genres__list" id="list_genres_HC">
								{visibleGenres.map((genre) => (
									<div
										key={genre.id}
										className={`header__catalog__navs__genres__list__genre header__catalog__navs__nav ${
											hoverCategory === genre.id ? 'header__catalog__navs__nav_active' : ''
										}`}
										id={`header__catalog__nav-${genre.id}`}
									>
										<div className="header__catalog__navs__genres__list__genre__icon">
											<img src="/img/icons/ganres/6.svg" alt="" />
										</div>
										<div className="header__catalog__navs__genres__list__genre__title txt">{genre.title}</div>
										<div className="header__catalog__navs__indicator" />
										<div
											className="header__catalog__navs__clickBlock"
											onMouseEnter={() => onCatalogNavEnter(genre.id)}
											onMouseLeave={onCatalogNavLeave}
											onClick={() =>
												navigateFromCatalog(`/catalog?genre=${encodeURIComponent(genre.slug || genre.id)}`)
											}
										/>
									</div>
								))}
							</div>
						</div>
						<div className="header__catalog__navs__authors">
							<div className="header__catalog__head txt">
								<div className="header__catalog__head__title">Издатели и разработчики</div>
								<Link href="/authors" className="header__catalog__head__more txt" onClick={() => setHeaderOpen(false)}>
									Показать все
								</Link>
							</div>
							<div className="header__catalog__navs__authors__list" id="list_authors_HC">
								{visibleAuthors.map((author) => {
									const authorLogo = toPublicAsset(author.logo)
									const authorHref = author.href || ''
									return (
									<div
										key={author.id}
										className={`header__catalog__navs__authors__list__author header__catalog__navs__nav ${
											hoverCategory === author.id ? 'header__catalog__navs__nav_active' : ''
										}`}
										id={`header__catalog__nav-${author.id}`}
									>
										<div className="header__catalog__navs__authors__list__author__img">
											{authorLogo ? (
												<img src={authorLogo} alt="" />
											) : (
												<span className="header__catalog__navs__authors__list__author__placeholder txt">
													{String(author.title || '?').slice(0, 1)}
												</span>
											)}
										</div>
										<div className="header__catalog__navs__authors__list__author__title txt">
											{authorHref ? (
												<Link
													href={authorHref}
													className="txt"
													style={{ color: 'inherit', textDecoration: 'none' }}
													onClick={() => setHeaderOpen(false)}
												>
													{author.title}
												</Link>
											) : (
												<span className="txt">{author.title}</span>
											)}
										</div>
										<div className="header__catalog__navs__indicator" />
										<div
											className="header__catalog__navs__clickBlock"
											onMouseEnter={() => onCatalogNavEnter(author.id)}
											onMouseLeave={onCatalogNavLeave}
											onClick={() => navigateFromCatalog(authorHref)}
										/>
									</div>
									)
								})}
							</div>
						</div>
					</div>
					<div
						className="header__catalog__gamelist"
						id="catalog_game_list"
						onClickCapture={(event) => {
							if (event.target?.closest?.('a')) setHeaderOpen(false)
						}}
					>
						{catalogGames.map((game) => (
							<GameCardHeaderCatalog key={`${hoverCategory}-${game.id}`} game={game} />
						))}
					</div>
				</div>
			</div>

			<div
				className={`header__basket ${basketOpen ? 'header__basket_active' : ''}`}
				style={{ display: basketOpen ? 'block' : 'none' }}
			>
				<div className="header__basket__head txt">
					<div className="header__basket__head__title">Корзина</div>
					<Link href="/basket" className="header__basket__head__link" onClick={() => setBasketOpen(false)}>
						К оплате
					</Link>
				</div>
				<div className="header__basket__grid" id="header_basket_grid">
					{basketCount === 0 ? (
						<div className="header__basket__grid__nothing flex-center txt">
							<div>Нет игр в корзине</div>
						</div>
					) : (
						basketGames.map((game) => <HeaderBasketRow key={game.id} game={game} />)
					)}
				</div>
			</div>

			<div
				className={`header__notification ${notificationOpen ? 'header__notification_active' : ''}`}
				style={{ display: notificationOpen ? 'block' : 'none' }}
			>
				<div className="header__notification__header">
					<div className="header__notification__header__title txt">Уведомления</div>
					<Link href="/profile" className="header__notification__header__link txt">
						Показать все
					</Link>
				</div>
				<div className="header__notification__grid" id="grid_notification">
					{storedNotifications.length === 0 ? (
						<div className="header__notification__grid__nothing flex-center txt">
							<div>Нет уведомлений</div>
						</div>
					) : (
						storedNotifications.slice(0, 20).map((n) => (
							<div
								key={n.id}
								className={`header__notification__grid__notification notification_${n.status} ${
									n.viewed ? '' : 'header__notification__grid__notification_new'
								}`}
								data-id={n.id}
								onMouseEnter={() => {
									if (!n.viewed) markNotificationViewed(n.id)
								}}
							>
								<div className="header__notification__grid__notification__point txt">
									<div
										className={
											n.status === 'error'
												? 'header__notification__grid__notification__point__circle header__notification__grid__notification__point__circle_error'
												: 'header__notification__grid__notification__point__circle'
										}
									/>
								</div>
								<div
									className="header__notification__grid__notification__text txt"
									dangerouslySetInnerHTML={{ __html: n.message }}
								/>
							</div>
						))
					)}
				</div>
			</div>

			<div className="header__notification_temporary" id="temporary_notification" style={{ visibility: 'visible' }}>
				<div className="header__notification_temporary__grid" id="grid_temporary_notification">
					{toasts.map((t) => (
						<div
							key={t.id}
							className={`header__notification_temporary__grid__notification notification_${t.type}`}
							id={t.id}
						>
							<div className="header__notification_temporary__grid__notification__point txt">
								<div
									className={`header__notification_temporary__grid__notification__point__circle ${
										t.type === 'false'
											? 'header__notification_temporary__grid__notification__point__circle_false'
											: 'header__notification_temporary__grid__notification__point__circle_true'
									}`}
								/>
							</div>
							<div
								className="header__notification_temporary__grid__notification__text txt"
								dangerouslySetInnerHTML={{ __html: t.messageHtml }}
							/>
						</div>
					))}
				</div>
			</div>
		</header>
	)
}

export default Header
