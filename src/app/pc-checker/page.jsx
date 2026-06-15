'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { checkGameCompatibilityWithPreferences, groupCompatibilityResults } from '@/lib/pcCompatibility'
import { gameHref, toPublicAsset } from '@/lib/gameRoutes'

const initialForm = {
	os: 'Windows 11',
	cpu: '',
	gpu: '',
	ramGb: '16',
	storageGb: '100',
	directx: '12',
	deviceType: 'desktop',
	wish: '',
}

const groupMeta = {
	recommended: {
		title: 'Компьютер уверенно потянет',
		empty: 'Игр под рекомендованные требования пока нет.',
	},
	minimum: {
		title: 'Подходит для минимальных настроек',
		empty: 'Игр только под минимум пока нет.',
	},
	not_supported: {
		title: 'Не подходит',
		empty: 'Нет игр, которые явно не подходят.',
	},
	unknown: {
		title: 'Недостаточно данных',
		empty: 'Нет игр с неопределенным результатом.',
	},
}

function CompatibilityCard({ result }) {
	const { toggleBasket, toggleFavorite, isInBasket, isInFavorite } = useShop()
	const { game } = result
	const image = toPublicAsset(game.imgH || game.imgW)
	const href = gameHref(game)
	const discount = game.oldPrice > 0 ? Math.round(((game.oldPrice - game.newPrice) / game.oldPrice) * 100) : 0

	return (
		<article className={`pcCheckerCard pcCheckerCard_${result.status}`}>
			<Link href={href} className="pcCheckerCard__image">
				{image ? <img src={image} alt={game.name} /> : null}
			</Link>
			<div className="pcCheckerCard__body txt">
				<div className="pcCheckerCard__top">
					<Link href={href} className="pcCheckerCard__title txt">{game.name}</Link>
					<div className="pcCheckerCard__score">{result.score}%</div>
				</div>
				<div className="pcCheckerCard__genres">
					{(game.genres || []).slice(0, 4).map((genre) => (
						<span key={genre.slug || genre.id}>{genre.title}</span>
					))}
				</div>
				<div className="pcCheckerCard__price">
					<span>{game.newPrice} в‚Ѕ</span>
					{game.oldPrice ? <s>{game.oldPrice} в‚Ѕ</s> : null}
					{discount ? <b>{discount}%</b> : null}
				</div>
				<div className="pcCheckerCard__reasons">
					{result.reasons.slice(0, 4).map((reason) => (
						<div key={reason}>{reason}</div>
					))}
					{result.missingData.length ? (
						<div>Нет данных: {result.missingData.slice(0, 3).join(', ')}</div>
					) : null}
				</div>
				<div className="pcCheckerCard__actions">
					<button
						type="button"
						className={`pcCheckerCard__button pcCheckerCard__button_blue ${isInBasket(game.id) ? 'pcCheckerCard__button_active' : ''}`}
						onClick={() => toggleBasket(game.id, game.name)}
					>
						{isInBasket(game.id) ? 'В корзине' : 'В корзину'}
					</button>
					<button
						type="button"
						className={`pcCheckerCard__button pcCheckerCard__button_red ${isInFavorite(game.id) ? 'pcCheckerCard__button_active' : ''}`}
						onClick={() => toggleFavorite(game.id, game.name)}
					>
						{isInFavorite(game.id) ? 'В избранном' : 'В избранное'}
					</button>
				</div>
			</div>
		</article>
	)
}

export default function PcCheckerPage() {
	const { games, loading, apiError } = useShop()
	const [form, setForm] = useState(initialForm)
	const [checked, setChecked] = useState(false)

	const userPc = useMemo(
		() => ({
			...form,
			ramGb: form.ramGb ? Number(form.ramGb) : null,
			storageGb: form.storageGb ? Number(form.storageGb) : null,
			directx: form.directx ? Number(form.directx) : null,
		}),
		[form]
	)

	const grouped = useMemo(() => {
		if (!checked) return groupCompatibilityResults([])
		return groupCompatibilityResults(
			games
				.map((game) => checkGameCompatibilityWithPreferences(game, userPc, form.wish))
				.sort((a, b) => b.score - a.score || a.game.name.localeCompare(b.game.name, 'ru'))
		)
	}, [checked, form.wish, games, userPc])

	const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

	const submit = (event) => {
		event.preventDefault()
		setChecked(true)
	}

	const reset = () => {
		setForm(initialForm)
		setChecked(false)
	}

	return (
		<main id="main" className="pcCheckerPage">
			<div className="inner inner_w1405p100">
				<section className="pcCheckerHero">
					<div className="pcCheckerHero__text txt">
						<h1>Подбор игр по параметрам ПК</h1>
						<p>Укажите железо, а мы сравним его с системными требованиями игр из Strapi и покажем, что запустится уверенно, что только на минимальных настройках, а где данных мало.</p>
					</div>
					<Link href="/catalog" className="pcCheckerHero__link txt">Вернуться в каталог</Link>
				</section>

				<form className="pcCheckerForm" onSubmit={submit}>
					<label className="txt">
						<span>Операционная система</span>
						<select value={form.os} onChange={set('os')}>
							<option>Windows 11</option>
							<option>Windows 10</option>
							<option>Windows 8</option>
							<option>Windows 7</option>
							<option>macOS</option>
							<option>Linux</option>
						</select>
					</label>
					<label className="txt">
						<span>CPU</span>
						<input value={form.cpu} onChange={set('cpu')} placeholder="Например: Intel Core i5-8400" />
					</label>
					<label className="txt">
						<span>GPU</span>
						<input value={form.gpu} onChange={set('gpu')} placeholder="Например: GeForce GTX 1060" />
					</label>
					<label className="txt">
						<span>RAM, GB</span>
						<input type="number" min="1" value={form.ramGb} onChange={set('ramGb')} />
					</label>
					<label className="txt">
						<span>Свободное место, GB</span>
						<input type="number" min="1" value={form.storageGb} onChange={set('storageGb')} />
					</label>
					<label className="txt">
						<span>DirectX</span>
						<select value={form.directx} onChange={set('directx')}>
							<option value="12">12</option>
							<option value="11">11</option>
							<option value="10">10</option>
							<option value="9">9</option>
						</select>
					</label>
					<label className="txt">
						<span>Тип устройства</span>
						<select value={form.deviceType} onChange={set('deviceType')}>
							<option value="desktop">Desktop</option>
							<option value="laptop">Laptop</option>
						</select>
					</label>
					<label className="txt pcCheckerForm__wide">
						<span>Пожелания к игре</span>
						<textarea
							value={form.wish}
							onChange={set('wish')}
							placeholder="Например: хочу кооперативный хоррор, открытый мир, RPG, без сложного PvP"
						/>
					</label>
					<div className="pcCheckerForm__actions">
						<button type="submit" className="catalogFilters__button catalogFilters__button_primary txt">Подобрать игры</button>
						<button type="button" className="catalogFilters__button catalogFilters__button_reset txt" onClick={reset}>Очистить</button>
					</div>
				</form>

				{loading ? <p className="txt shop-state">Загрузка игр...</p> : null}
				{apiError ? <p className="txt shop-state shop-state_error">{apiError}</p> : null}
				{!checked && !loading ? (
					<p className="txt shop-state">Заполните параметры и нажмите “Подобрать игры”, чтобы увидеть подборку.</p>
				) : null}

				{checked ? (
					<div className="pcCheckerResults">
						{Object.entries(groupMeta).map(([key, meta]) => (
							<section key={key} className="pcCheckerGroup">
								<h2 className="txt">{meta.title}</h2>
								{grouped[key].length ? (
									<div className="pcCheckerGroup__grid">
										{grouped[key].map((result) => (
											<CompatibilityCard key={`${result.status}-${result.game.id}`} result={result} />
										))}
									</div>
								) : (
									<p className="txt shop-state">{meta.empty}</p>
								)}
							</section>
						))}
					</div>
				) : null}
			</div>
		</main>
	)
}
