'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toPublicAsset } from '@/lib/gameRoutes'

function setTime(seconds) {
	const s = Number(seconds)
	if (!Number.isFinite(s) || s < 0) return '0:00'
	const m = Math.floor(s / 60)
	const r = Math.round(s % 60)
	return `${m}:${String(r).padStart(2, '0')}`
}

export default function GameBannerPlayer({ game, steamPct, metaScore }) {
	const trailers = game.trailers || []
	const screenshots = game.screenshots || []

	const flatMedia = useMemo(() => {
		const t = trailers.map((tr, i) => ({
			type: 't',
			key: `t-${game.id}-${i}`,
			preview: toPublicAsset(tr.preview),
			video: tr.video,
		}))
		const s = screenshots.map((url, i) => ({
			type: 's',
			key: `s-${game.id}-${i}`,
			url: toPublicAsset(url),
		}))
		return [...t, ...s]
	}, [game.id, trailers, screenshots])

	const shotIndices = useMemo(
		() => flatMedia.map((x, i) => (x.type === 's' ? i : -1)).filter((i) => i >= 0),
		[flatMedia]
	)

	const defaultShot = toPublicAsset(game.imgH)

	const initialIdx = useMemo(() => {
		if (trailers.length > 0 && shotIndices.length > 0) return shotIndices[0]
		if (shotIndices.length > 0) return shotIndices[0]
		if (flatMedia.length > 0) return 0
		return 0
	}, [trailers.length, shotIndices, flatMedia.length])

	const [activeIdx, setActiveIdx] = useState(initialIdx)
	const [scrListClosed, setScrListClosed] = useState(false)
	const [playing, setPlaying] = useState(true)
	const [curr, setCurr] = useState(0)
	const [dur, setDur] = useState(0)
	const [vol, setVol] = useState(0.5)
	const [volStore, setVolStore] = useState(0.5)
	const [hoverTime, setHoverTime] = useState('0:00')
	const [hoverLeftPct, setHoverLeftPct] = useState(0)
	const [hoverTf, setHoverTf] = useState('translateX(-50%)')
	const [raceMousePct, setRaceMousePct] = useState(0)
	const [volMousePct, setVolMousePct] = useState(0)
	const [hoverRaceOn, setHoverRaceOn] = useState(false)

	const playerRef = useRef(null)
	const videoRef = useRef(null)
	const raceRef = useRef(null)
	const raceMouseRef = useRef(null)
	const volRaceRef = useRef(null)
	const mediaScrollRef = useRef(null)
	const draggingRef = useRef(false)

	const item = flatMedia[activeIdx]
	const isVideo = item?.type === 't'
	const visualImg = !isVideo && item?.type === 's' ? item.url : defaultShot

	useEffect(() => {
		setActiveIdx(initialIdx)
	}, [initialIdx])

	const selectMedia = useCallback(
		(idx) => {
			if (idx < 0 || idx >= flatMedia.length) return
			setActiveIdx(idx)
			setScrListClosed(false)
		},
		[flatMedia.length]
	)

	const scrollShot = useCallback(
		(dir) => {
			if (!shotIndices.length) return
			const curShotPos = shotIndices.indexOf(activeIdx)
			const pos = curShotPos >= 0 ? curShotPos : 0
			let next = pos + dir
			if (next >= shotIndices.length) next = 0
			if (next < 0) next = shotIndices.length - 1
			selectMedia(shotIndices[next])
		},
		[activeIdx, shotIndices, selectMedia]
	)

	const toggleFullscreen = useCallback(async () => {
		const el = playerRef.current
		if (!el) return
		try {
			if (!document.fullscreenElement) {
				await el.requestFullscreen()
				el.classList.add('mainInfo__banner_fullscreen')
			} else {
				await document.exitFullscreen()
				el.classList.remove('mainInfo__banner_fullscreen')
			}
		} catch {
			/* ignore */
		}
	}, [])

	useEffect(() => {
		const onFs = () => {
			const el = playerRef.current
			if (!el) return
			if (!document.fullscreenElement) el.classList.remove('mainInfo__banner_fullscreen')
		}
		document.addEventListener('fullscreenchange', onFs)
		return () => document.removeEventListener('fullscreenchange', onFs)
	}, [])

	const onTimeUpdate = useCallback(() => {
		const v = videoRef.current
		if (!v) return
		setCurr(v.currentTime)
		setDur(v.duration || 0)
	}, [])

	useEffect(() => {
		const v = videoRef.current
		if (!isVideo || !v) return
		v.volume = vol
		const run = () => {
			if (playing) {
				v.play().catch(() => setPlaying(false))
			} else {
				v.pause()
			}
		}
		run()
		v.addEventListener('timeupdate', onTimeUpdate)
		v.addEventListener('loadedmetadata', onTimeUpdate)
		return () => {
			v.removeEventListener('timeupdate', onTimeUpdate)
			v.removeEventListener('loadedmetadata', onTimeUpdate)
		}
	}, [isVideo, playing, item?.video, vol, onTimeUpdate])

	const togglePlay = useCallback(() => {
		setPlaying((p) => !p)
	}, [])

	const toggleMute = useCallback(() => {
		if (vol > 0.05) {
			setVolStore(vol)
			setVol(0)
		} else {
			setVol(volStore || 0.5)
		}
	}, [vol, volStore])

	const pct = dur > 0 ? (curr / dur) * 100 : 0

	const onRaceMove = useCallback(
		(e) => {
			const race = raceRef.current
			if (!race) return
			const w = race.clientWidth
			const ox = e.nativeEvent.offsetX
			const p = (ox / w) * 100
			setRaceMousePct(p)
			const d = videoRef.current?.duration || 0
			setHoverTime(setTime(d * (p / 100)))
			let tf = 'translateX(-50%)'
			if (ox < 25) tf = 'translateX(0%)'
			else if (w - ox < 25) tf = 'translateX(-100%)'
			setHoverTf(tf)
			setHoverLeftPct(p)
			if (draggingRef.current && videoRef.current && d) {
				videoRef.current.currentTime = (ox / w) * d
			}
		},
		[]
	)

	const onRaceClick = useCallback((e) => {
		const race = raceRef.current
		const v = videoRef.current
		if (!race || !v || !v.duration) return
		v.currentTime = (e.nativeEvent.offsetX / race.clientWidth) * v.duration
	}, [])

	const onVolClick = useCallback((e) => {
		const t = volRaceRef.current
		if (!t) return
		const nv = e.nativeEvent.offsetX / t.clientWidth
		setVol(Math.min(1, Math.max(0, nv)))
		setVolStore(Math.min(1, Math.max(0, nv)))
	}, [])

	const onVolMove = useCallback((e) => {
		const t = volRaceRef.current
		if (!t) return
		setVolMousePct((e.nativeEvent.offsetX / t.clientWidth) * 100)
		if (draggingRef.current) {
			const nv = e.nativeEvent.offsetX / t.clientWidth
			setVol(Math.min(1, Math.max(0, nv)))
			setVolStore(Math.min(1, Math.max(0, nv)))
		}
	}, [])

	const onWheelMedia = useCallback((e) => {
		e.preventDefault()
		e.stopPropagation()
		const el = mediaScrollRef.current
		if (!el) return
		const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
		el.scrollLeft += delta
	}, [])

	useEffect(() => {
		const el = mediaScrollRef.current
		if (!el) return
		el.addEventListener('wheel', onWheelMedia, { passive: false })
		return () => el.removeEventListener('wheel', onWheelMedia)
	}, [flatMedia.length, onWheelMedia])

	if (!flatMedia.length) {
		return (
			<div className="mainInfo__banner" id="player" ref={playerRef}>
				<div className="mainInfo__banner__visual" id="game_visual">
					<div className="mainInfo__banner__visual__imgBlock" id="visual_main_screenshot">
						{visualImg ? <img className="def-optimize_img" src={visualImg} alt="" id="game_img" /> : null}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="mainInfo__banner" id="player" ref={playerRef}>
			<div className="mainInfo__banner__visual" id="game_visual">
				{isVideo && item?.video ? (
					<video
						ref={videoRef}
						key={item.video}
						className="def-optimize_img"
						src={item.video}
						loop
						playsInline
						id="video"
					/>
				) : (
					<div className="mainInfo__banner__visual__imgBlock" id="visual_main_screenshot">
						{visualImg ? <img className="def-optimize_img" src={visualImg} alt="" id="game_img" /> : null}
					</div>
				)}
			</div>
			<div className="mainInfo__banner__interface">
				<div
					className={`mainInfo__banner__interface__top ${isVideo && playing ? 'mainInfo__banner__interface__top_hidden' : ''}`}
				>
					<div className="mainInfo__banner__interface__top__rating txt">
						<div className="mainInfo__banner__interface__top__point mainInfo__banner__interface__top__point_steam">
							<img src="/img/icons/social/steam.svg" alt="" />
							<div className="mainInfo__banner__interface__top__point__rating">{steamPct}%</div>
						</div>
						<div className="mainInfo__banner__interface__top__point mainInfo__banner__interface__top__point_metacritic">
							<span className="txt" style={{ fontWeight: 700, fontSize: 14 }}>
								M
							</span>
							<div className="mainInfo__banner__interface__top__point__rating">{metaScore}</div>
						</div>
					</div>
					{game.preOrder ? (
						<div className="mainInfo__banner__interface__top__point mainInfo__banner__interface__top__point_preOrder txt">
							<div className="mainInfo__banner__interface__top__point__key">Предзаказ</div>
							<div className="mainInfo__banner__interface__top__point__value">{game.preOrder}</div>
						</div>
					) : null}
				</div>
				<div
					className={`mainInfo__banner__interface__bottom ${scrListClosed ? 'mainInfo__banner__interface__bottom_hidden' : ''}`}
				>
					<div
						className={`mainInfo__banner__interface__bottom__screenshotsIF ${
							isVideo ? 'mainInfo__banner__interface__bottom__screenshotsIF_hidden' : ''
						}`}
					>
						<div className="mainInfo__banner__interface__bottom__screenshotsIF__arrows">
							<button
								type="button"
								title="Назад"
								className="mainInfo__banner__interface__bottom__screenshotsIF__arrows__arrow"
								onClick={() => scrollShot(-1)}
							>
								<img
									src="/img/icons/main/svg/arrow_right.svg"
									alt=""
									style={{ transform: 'rotate(180deg)', filter: 'brightness(0) invert(1)' }}
								/>
							</button>
							<button
								type="button"
								title="Вперёд"
								className="mainInfo__banner__interface__bottom__screenshotsIF__arrows__arrow"
								onClick={() => scrollShot(1)}
							>
								<img src="/img/icons/main/svg/arrow_right.svg" alt="" style={{ filter: 'brightness(0) invert(1)' }} />
							</button>
						</div>
						<div className="mainInfo__banner__interface__bottom__screenshotsIF__buttonFullScreenBlock" id="buttonFullScreenBlock">
							<button
								type="button"
								className="mainInfo__banner__interface__bottom__screenshotsIF__buttonFullScreenBlock__button"
								id="fullScreen_btn"
								title="Полный экран"
								onClick={toggleFullscreen}
							>
								<svg
									className="mainInfo__banner__interface__bottom__screenshotsIF__buttonFullScreenBlock__button__entry"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M23 4C23 2.34315 21.6569 1 20 1H16C15.4477 1 15 1.44772 15 2C15 2.55228 15.4477 3 16 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 21.4477 9 22 9C22.5523 9 23 8.55228 23 8V4Z"
										fill="#fff"
									/>
									<path
										d="M23 16C23 15.4477 22.5523 15 22 15C21.4477 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 21.4477 15 22C15 22.5523 15.4477 23 16 23H20C21.6569 23 23 21.6569 23 20V16Z"
										fill="#fff"
									/>
									<path
										d="M4 21H8C8.55228 21 9 21.4477 9 22C9 22.5523 8.55228 23 8 23H4C2.34315 23 1 21.6569 1 20V16C1 15.4477 1.44772 15 2 15C2.55228 15 3 15.4477 3 16V20C3 20.5523 3.44772 21 4 21Z"
										fill="#fff"
									/>
									<path
										d="M1 8C1 8.55228 1.44772 9 2 9C2.55228 9 3 8.55228 3 8L3 4C3 3.44772 3.44772 3 4 3H8C8.55228 3 9 2.55228 9 2C9 1.44772 8.55228 1 8 1H4C2.34315 1 1 2.34315 1 4V8Z"
										fill="#fff"
									/>
								</svg>
								<svg
									className="mainInfo__banner__interface__bottom__screenshotsIF__buttonFullScreenBlock__button__exit"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7 9C8.10457 9 9 8.10457 9 7V3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3V7H3C2.44772 7 2 7.44772 2 8C2 8.55228 2.44772 9 3 9H7Z"
										fill="#fff"
									/>
									<path
										d="M17 9C15.8954 9 15 8.10457 15 7V3C15 2.44772 15.4477 2 16 2C16.5523 2 17 2.44772 17 3V7H21C21.5523 7 22 7.44772 22 8C22 8.55228 21.5523 9 21 9H17Z"
										fill="#fff"
									/>
									<path
										d="M17 15C15.8954 15 15 15.8954 15 17V21C15 21.5523 15.4477 22 16 22C16.5523 22 17 21.5523 17 21V17H21C21.5523 17 22 16.5523 22 16C22 15.4477 21.5523 15 21 15H17Z"
										fill="#fff"
									/>
									<path
										d="M9 17C9 15.8954 8.10457 15 7 15H3C2.44772 15 2 15.4477 2 16C2 16.5523 2.44772 17 3 17H7V21C7 21.5523 7.44772 22 8 22C8.55228 22 9 21.5523 9 21V17Z"
										fill="#fff"
									/>
								</svg>
							</button>
						</div>
					</div>
					<div className={`videoIF ${isVideo ? '' : 'videoIF_hidden'}`}>
						<button
							type="button"
							title="Пауза"
							className={`videoIF__button videoIF__playButton ${playing ? 'videoIF__playButton_pause' : ''}`}
							onClick={togglePlay}
						>
							<svg className="_play" viewBox="-0.5 0 7 7" xmlns="http://www.w3.org/2000/svg">
								<g fill="none" fillRule="evenodd">
									<g transform="translate(-347 -3766)" fill="#fff">
										<g transform="translate(56 160)">
											<path d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322" />
										</g>
									</g>
								</g>
							</svg>
							<svg className="_pause" viewBox="-1 0 8 8" xmlns="http://www.w3.org/2000/svg">
								<g fill="none" fillRule="evenodd">
									<g transform="translate(-227 -3765)" fill="#fff">
										<g transform="translate(56 160)">
											<path d="M172,3605 C171.448,3605 171,3605.448 171,3606 L171,3612 C171,3612.552 171.448,3613 172,3613 C172.552,3613 173,3612.552 173,3612 L173,3606 C173,3605.448 172.552,3605 172,3605 M177,3606 L177,3612 C177,3612.552 176.552,3613 176,3613 C175.448,3613 175,3612.552 175,3612 L175,3606 C175,3605.448 175.448,3605 176,3605 C176.552,3605 177,3605.448 177,3606" />
										</g>
									</g>
								</g>
							</svg>
						</button>
						<div className="videoIF__raceBlock">
							<div className="videoIF__race__time txt">
								<div className="videoIF__race__time__point videoIF__race__time__point_current">{setTime(curr)}</div>
								<div className="videoIF__race__time__point videoIF__race__time__point_all">{setTime(dur)}</div>
								<div
									className={`videoIF__race__time__point videoIF__race__time__point_hover ${
										hoverRaceOn ? 'videoIF__race__time__point_hover_active' : ''
									}`}
									style={{ left: `${hoverLeftPct}%`, transform: hoverTf }}
								>
									{hoverTime}
								</div>
							</div>
							<div
								className="videoIF__race"
								ref={raceRef}
								onMouseMove={onRaceMove}
								onMouseEnter={() => setHoverRaceOn(true)}
								onMouseLeave={() => {
									draggingRef.current = false
									setHoverRaceOn(false)
								}}
								onMouseDown={() => {
									draggingRef.current = true
								}}
								onMouseUp={() => {
									draggingRef.current = false
								}}
								onClick={onRaceClick}
							>
								<div className="videoIF__race__mouse" ref={raceMouseRef} style={{ width: `${raceMousePct}%` }} />
								<div className="videoIF__race__value" style={{ width: `${pct}%` }} />
							</div>
						</div>
						<div className={`videoIF__volume ${vol < 0.05 ? 'videoIF__volume_muted' : ''}`}>
							<button type="button" className="videoIF__volume__icon" title="Звук" onClick={toggleMute}>
								<img
									className={vol < 0.05 ? '_volume_muted' : '_volume_on'}
									src={vol < 0.05 ? '/img/icons/player/volume-muted.svg' : '/img/icons/player/volume.svg'}
									alt=""
								/>
							</button>
							<div
								className="videoIF__volume__race"
								ref={volRaceRef}
								onClick={onVolClick}
								onMouseMove={onVolMove}
								onMouseDown={() => {
									draggingRef.current = true
								}}
								onMouseUp={() => {
									draggingRef.current = false
								}}
								onMouseLeave={() => {
									draggingRef.current = false
								}}
							>
								<div className="videoIF__volume__race__num txt">{Math.round(vol * 100)}</div>
								<div className="videoIF__volume__race__mouse" style={{ width: `${volMousePct}%` }} />
								<div className="videoIF__volume__race__value" style={{ width: `${vol * 100}%` }} />
								<div className="videoIF__volume__race__forMouse" />
							</div>
						</div>
						<button
							type="button"
							className={`videoIF__button videoIF__buttonTglScrList ${scrListClosed ? 'videoIF__buttonTglScrList_closed' : ''}`}
							title="Список скриншотов"
							onClick={() => setScrListClosed((c) => !c)}
						>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
									fill="#fff"
								/>
							</svg>
						</button>
						<button type="button" className="videoIF__button videoIF__buttonFullScreen" title="Полный экран" onClick={toggleFullscreen}>
							<svg className="videoIF__buttonFullScreen__entry" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M23 4C23 2.34315 21.6569 1 20 1H16C15.4477 1 15 1.44772 15 2C15 2.55228 15.4477 3 16 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 21.4477 9 22 9C22.5523 9 23 8.55228 23 8V4Z"
									fill="#fff"
								/>
								<path
									d="M23 16C23 15.4477 22.5523 15 22 15C21.4477 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 21.4477 15 22C15 22.5523 15.4477 23 16 23H20C21.6569 23 23 21.6569 23 20V16Z"
									fill="#fff"
								/>
								<path
									d="M4 21H8C8.55228 21 9 21.4477 9 22C9 22.5523 8.55228 23 8 23H4C2.34315 23 1 21.6569 1 20V16C1 15.4477 1.44772 15 2 15C2.55228 15 3 15.4477 3 16V20C3 20.5523 3.44772 21 4 21Z"
									fill="#fff"
								/>
								<path
									d="M1 8C1 8.55228 1.44772 9 2 9C2.55228 9 3 8.55228 3 8L3 4C3 3.44772 3.44772 3 4 3H8C8.55228 3 9 2.55228 9 2C9 1.44772 8.55228 1 8 1H4C2.34315 1 1 2.34315 1 4V8Z"
									fill="#fff"
								/>
							</svg>
							<svg className="videoIF__buttonFullScreen__exit" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M7 9C8.10457 9 9 8.10457 9 7V3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3V7H3C2.44772 7 2 7.44772 2 8C2 8.55228 2.44772 9 3 9H7Z"
									fill="#fff"
								/>
								<path
									d="M17 9C15.8954 9 15 8.10457 15 7V3C15 2.44772 15.4477 2 16 2C16.5523 2 17 2.44772 17 3V7H21C21.5523 7 22 7.44772 22 8C22 8.55228 21.5523 9 21 9H17Z"
									fill="#fff"
								/>
								<path
									d="M17 15C15.8954 15 15 15.8954 15 17V21C15 21.5523 15.4477 22 16 22C16.5523 22 17 21.5523 17 21V17H21C21.5523 17 22 16.5523 22 16C22 15.4477 21.5523 15 21 15H17Z"
									fill="#fff"
								/>
								<path
									d="M9 17C9 15.8954 8.10457 15 7 15H3C2.44772 15 2 15.4477 2 16C2 16.5523 2.44772 17 3 17H7V21C7 21.5523 7.44772 22 8 22C8.55228 22 9 21.5523 9 21V17Z"
									fill="#fff"
								/>
							</svg>
						</button>
					</div>
					<div
						className="mainInfo__banner__interface__bottom__scroll"
						id="interface_scroll_horizontal"
						data-scrolltype="def"
						ref={mediaScrollRef}
					>
						<div className="mainInfo__banner__interface__bottom__medialist" id="game_medialist">
							{flatMedia.map((m, idx) => {
								const active = idx === activeIdx
								if (m.type === 't') {
									return (
										<button
											key={m.key}
											type="button"
											className={`mainInfo__banner__interface__bottom__medialist__media mainInfo__banner__interface__bottom__medialist__media_video ${
												active ? 'mainInfo__banner__interface__bottom__medialist__media_active' : ''
											}`}
											onClick={() => selectMedia(idx)}
										>
											<div className="mainInfo__banner__interface__bottom__medialist__media__playButton">
												<div className="mainInfo__banner__interface__bottom__medialist__media__playButton__icon">
													<svg viewBox="-0.5 0 7 7" xmlns="http://www.w3.org/2000/svg">
														<g fill="none" fillRule="evenodd">
															<g transform="translate(-347 -3766)" fill="#fff">
																<g transform="translate(56 160)">
																	<path d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322" />
																</g>
															</g>
														</g>
													</svg>
												</div>
											</div>
											<div
												className="mainInfo__banner__interface__bottom__medialist__media__preview"
												style={{ backgroundImage: `url('${m.preview}')` }}
											/>
										</button>
									)
								}
								return (
									<button
										key={m.key}
										type="button"
										className={`mainInfo__banner__interface__bottom__medialist__media mainInfo__banner__interface__bottom__medialist__media_screenshot ${
											active ? 'mainInfo__banner__interface__bottom__medialist__media_active' : ''
										}`}
										onClick={() => selectMedia(idx)}
									>
										<div
											className="mainInfo__banner__interface__bottom__medialist__media__screenshot"
											style={{ backgroundImage: `url('${m.url}')` }}
										/>
									</button>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
