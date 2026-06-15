'use client'

import Link from 'next/link'
import { useShop } from '@/context/ShopContext'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

export default function LineGameRow({ game, mode }) {
	const { toggleBasket, toggleFavorite, isInBasket } = useShop()
	const href = gameHref(game)
	const imageSrc = toPublicAsset(game.mainCapsule || game.imgH || game.coverImage || game.headerImage || game.libraryCapsule || game.imgW)
	const mobileImageSrc = toPublicAsset(game.libraryCapsule || game.imgW || game.coverImage || game.imgH || game.mainCapsule)
	const inBasket = isInBasket(game.id)
	const typeLabel = {
		game: 'Игра',
		dlc: 'DLC',
		edition: 'Издание',
	}[game.itemType || 'game']
	const preOrder =
		game.preOrder !== '' && game.preOrder != null ? (
			<div className="lineGames__game__left__nameBlock__preOrder txt">
				Предзаказ<span>{game.preOrder}</span>
			</div>
		) : null
	const itemMark =
		game.itemType === 'edition'
			? 'EDITION'
			: game.itemType === 'dlc' || game.dls || game.isDls
				? 'DLC'
				: ''

	return (
		<article className="lineGames__game" data-game_id={game.id}>
			<div className="lineGames__game__forHover">
				<div className="lineGames__game__forHover__bg lineGames__game__forHover__bg_blue" />
				<div className="lineGames__game__forHover__bg lineGames__game__forHover__bg_red" />
			</div>
			<div className="lineGames__game__left">
				<div className="lineGames__game__left__imgBlock">
					{imageSrc || mobileImageSrc ? (
						<picture className="lineGames__game__left__imgBlock__picture">
							{mobileImageSrc && mobileImageSrc !== imageSrc ? (
								<source media="(max-width: 620px)" srcSet={mobileImageSrc} />
							) : null}
							<img src={imageSrc || mobileImageSrc} alt={game.name} />
						</picture>
					) : null}
					{itemMark ? <div className="lineGames__game__left__imgBlock__dlc txt">{itemMark}</div> : null}
				</div>
				<div className="lineGames__game__left__nameBlock">
					<Link href={href} className="lineGames__game__left__nameBlock__name txt">
						{game.name}
					</Link>
					{game.itemType && game.itemType !== 'game' ? (
						<div className="lineGames__game__left__nameBlock__type txt">{typeLabel}</div>
					) : null}
					{preOrder}
					{game.steamLink || game.steamUrl ? (
						<a
							href={game.steamLink || game.steamUrl}
							className="lineGames__game__left__nameBlock__linkPlatform txt"
							target="_blank"
							rel="noreferrer"
						>
							Игра в Steam
						</a>
					) : null}
				</div>
			</div>
			<div className="lineGames__game__right">
				<div className="lineGames__game__right__price txt">
					{game.newPrice} ₽<span>{game.oldPrice} ₽</span>
				</div>
				<div className="lineGames__game__right__buttons">
					{mode === 'basket' ? (
						<button
							type="button"
							className="lineGames__game__right__buttons__button lineGames__game__right__buttons__button_red"
							title="Удалить из корзины"
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
					) : (
						<>
							<button
								type="button"
								className="lineGames__game__right__buttons__button lineGames__game__right__buttons__button_red"
								title="Удалить из избранного"
								onClick={() => toggleFavorite(game.id, game.name)}
							>
								<svg width="28" height="21" viewBox="0 0 28 21" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M22.1485 1.77087C19.5473 0.551821 16.2594 1.2991 14.4215 3.47773L22.1485 1.77087ZM14.4215 3.47773C12.5865 1.2991 9.31075 0.552764 6.69358 1.76993L6.68981 1.77182C5.05478 2.54174 3.81885 3.92686 3.33108 5.71298C2.84425 7.4991 3.13012 9.5862 4.33681 11.7384C5.95956 14.6473 8.78241 16.8515 13.2478 20.3378L13.8394 20.8002C14.0052 20.9297 14.2096 21.0001 14.4201 21.0001C14.6305 21.0001 14.8349 20.9297 15.0008 20.8002L15.5923 20.3378C20.0568 16.8524 22.8796 14.6483 24.5024 11.7403C25.7195 9.58904 26.0119 7.50098 25.5251 5.71298C25.0364 3.92403 23.7929 2.53986 22.1485 1.77087M21.3493 3.47868C19.1586 2.45305 16.2726 3.43905 15.2782 5.61485C15.203 5.77931 15.0821 5.91871 14.93 6.01645C14.7779 6.11419 14.6009 6.16616 14.4201 6.16616C14.2393 6.16616 14.0623 6.11419 13.9101 6.01645C13.758 5.91871 13.6372 5.77931 13.562 5.61485C12.5685 3.43999 9.70323 2.45211 7.49081 3.47962C6.32374 4.02971 5.48406 4.99117 5.15102 6.21022C4.81892 7.43022 4.96893 9.00876 5.98315 10.8166L5.98409 10.8185C7.38797 13.3349 9.84663 15.2852 14.4205 18.8593C18.9935 15.2852 21.4522 13.3349 22.8561 10.8185L22.8589 10.8128C23.8825 9.00498 24.0363 7.42739 23.7042 6.21022C23.3721 4.99306 22.5287 4.03065 21.3503 3.47962H21.3484L21.3493 3.47868Z"
										fill="white"
									/>
									<rect
										x="1.29883"
										width="30.6523"
										height="2.39213"
										rx="1.19607"
										transform="rotate(32.8906 1.29883 0)"
										fill="white"
									/>
								</svg>
							</button>
							<button
								type="button"
								className={`lineGames__game__right__buttons__button lineGames__game__right__buttons__button_blue ${
									inBasket ? 'lineGames__game__right__buttons__button_active' : ''
								}`}
								title="В корзину"
								onClick={() => toggleBasket(game.id, game.name)}
							>
								<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
									<g clipPath={`url(#clip_basket_line_${game.id})`}>
										<path
											d="M17.9657 15.297H7.44611C6.20274 15.297 5.13652 14.4095 4.91081 13.1868L2.88636 2.38933C2.79857 2.00033 2.44748 1.71898 2.048 1.71898H0.859367C0.384739 1.71898 0 1.33424 0 0.859611C0 0.384983 0.384739 0.000244141 0.859367 0.000244141H2.048C3.25562 0.000244141 4.31583 0.857333 4.56887 2.03815L4.57325 2.05985L4.79939 3.26579H21.1404C21.6694 3.26579 22.0757 3.74102 21.9881 4.26644L20.5087 13.1427C20.3007 14.3909 19.2312 15.297 17.9657 15.297ZM5.12161 4.98457L6.60054 12.8724C6.67625 13.2824 7.03164 13.5782 7.44611 13.5782H17.9657C18.3875 13.5782 18.744 13.2763 18.8134 12.8602L20.126 4.98457H5.12161ZM8.03143 11.1563L7.39614 7.71882C7.18959 6.60147 8.87945 6.28763 9.08626 7.40644L9.72154 10.8439C9.92809 11.9614 8.23836 12.2761 8.03143 11.1563ZM15.6619 10.8588L16.2351 7.4213C16.4219 6.30073 18.1176 6.58162 17.9304 7.70399L17.3572 11.1415C17.167 12.2823 15.4763 11.972 15.6619 10.8588Z"
											fill="#fff"
										/>
										<path
											d="M7.56248 22C6.14091 22 4.98438 20.8434 4.98438 19.4219C4.98438 18.0003 6.14091 16.8438 7.56248 16.8438C8.98404 16.8438 10.1406 18.0003 10.1406 19.4219C10.1406 20.8434 8.98404 22 7.56248 22ZM7.56248 18.5625C7.08862 18.5625 6.70311 18.948 6.70311 19.4219C6.70311 19.8957 7.08862 20.2812 7.56248 20.2812C8.03633 20.2812 8.42184 19.8957 8.42184 19.4219C8.42184 18.948 8.03633 18.5625 7.56248 18.5625Z"
											fill="#fff"
										/>
										<path
											d="M17.875 22C16.4534 22 15.2969 20.8434 15.2969 19.4219C15.2969 18.0003 16.4534 16.8438 17.875 16.8438C19.2965 16.8438 20.4531 18.0003 20.4531 19.4219C20.4531 20.8434 19.2965 22 17.875 22ZM17.875 18.5625C17.4011 18.5625 17.0156 18.948 17.0156 19.4219C17.0156 19.8957 17.4011 20.2812 17.875 20.2812C18.3488 20.2812 18.7343 19.8957 18.7343 19.4219C18.7343 18.948 18.3488 18.5625 17.875 18.5625Z"
											fill="#fff"
										/>
										<path
											d="M11.8594 10.9999V7.56246C11.8594 6.42629 13.5781 6.42465 13.5781 7.56246V10.9999C13.5781 12.136 11.8594 12.1377 11.8594 10.9999Z"
											fill="#fff"
										/>
									</g>
									<defs>
										<clipPath id={`clip_basket_line_${game.id}`}>
											<rect width="22" height="22" fill="#fff" />
										</clipPath>
									</defs>
								</svg>
							</button>
						</>
					)}
				</div>
			</div>
		</article>
	)
}
