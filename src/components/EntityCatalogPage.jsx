'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import GameCardH from '@/components/GameCard/GameCardH'
import { toPublicAsset } from '@/lib/gameRoutes'

export default function EntityCatalogPage({ entity, games, loading, backHref, kind }) {
	const [aboutOpen, setAboutOpen] = useState(false)
	const banner = toPublicAsset(entity?.image || entity?.logo) || '/img/banners/big.png'
	const title = entity?.title || entity?.name || ''
	const label =
		kind === 'developer'
			? 'Разработчик'
			: kind === 'publisher'
				? 'Издатель'
				: 'Серия игр'

	const sortedGames = useMemo(() => games || [], [games])
	const aboutTitle = entity?.aboutTitle || entity?.subtitle || '\u041e\u0431 \u0441\u0435\u0440\u0438\u0438'

	if (!entity && !loading) {
		return (
			<main id="main" className="inner inner_w1220p150" style={{ padding: '3rem 1rem' }}>
				<h1 className="txt">Страница не найдена</h1>
				<Link href={backHref} className="txt">К каталогу</Link>
			</main>
		)
	}

	return (
		<main id="main" className={kind === 'series' ? 'seriesPage' : undefined}>
			<div className="topImgParalaxBlock" id="top_img_paralax_block">
				<img src={banner} alt="" />
			</div>
			<div className="inner inner_w1220p150">
				{kind === 'series' ? (
					<>
						<section className="series__head txt">
							<span className="flex-center">{label}</span>
							<h2 className="flex-center">{title || 'Загрузка...'}</h2>
						</section>
						{entity?.description ? (
							<section className={`series__about ${aboutOpen ? '' : 'series__about_hidden'}`}>
								<div className="series__about__block txt" onClick={() => setAboutOpen((v) => !v)}>
									<h3>{aboutTitle}</h3>
									<p>{entity.description}</p>
								</div>
								<div className="series__about__gradient" onClick={() => setAboutOpen((v) => !v)} />
								<div className="series__about__buttonBlock">
									<button className="txt" type="button" onClick={() => setAboutOpen((v) => !v)} title="Открыть">
										<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#fff" />
										</svg>
									</button>
								</div>
							</section>
						) : null}
					</>
				) : (
					<section className="author__top">
						<div className="author__top__head">
							<div className="author__top__head__left">
								<div className="author__top__head__left__logo flex-center">
									<div className="author__top__head__left__logo__imgBlock">
										{entity?.logo || entity?.image ? <img src={toPublicAsset(entity.logo || entity.image)} alt="" /> : null}
									</div>
								</div>
								<div className="author__top__head__left__title txt">
									<span>{label}</span>
									<h2>{title || 'Загрузка...'}</h2>
								</div>
							</div>
						</div>
						<div className="author__top__about txt">
							<h3>Описание</h3>
							<p>{entity?.description || 'Описание можно заполнить в Strapi.'}</p>
						</div>
					</section>
				)}
				<section className={kind === 'series' ? 'series__games' : 'author__games'} id={`switch_section-${kind}`}>
					<div className="heading heading_title">
						<h2 className="txt">Все игры</h2>
					</div>
					<div className={kind === 'series' ? 'series__games__grid griding_3InRow' : 'griding_3InRow'}>
						{loading ? <p className="txt" style={{ gridColumn: '1 / -1' }}>Загрузка...</p> : null}
						{!loading && sortedGames.length === 0 ? (
							<p className="txt" style={{ gridColumn: '1 / -1' }}>Пока нет привязанных игр.</p>
						) : (
							sortedGames.map((game) => <GameCardH key={game.id} game={game} />)
						)}
					</div>
				</section>
			</div>
		</main>
	)
}
