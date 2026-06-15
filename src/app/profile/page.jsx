'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShop } from '@/context/ShopContext'
import GameCardH from '@/components/GameCard/GameCardH'
import { toPublicAsset } from '@/lib/gameRoutes'

const NOTIFICATION_FILTERS = [
	{ id: 'all', title: 'Все' },
	{ id: 'new', title: 'Новые' },
	{ id: 'transactions', title: 'Транзакции' },
	{ id: 'discounts', title: 'Скидки' },
]

function notificationText(notification) {
	return `${notification?.status || ''} ${notification?.type || ''} ${notification?.message || ''}`.toLowerCase()
}

function notificationMatchesFilter(notification, filter) {
	if (filter === 'new') return !notification.viewed
	if (filter === 'transactions') return /(транзакц|заказ|оплат|покуп|корзин|checkout|payment)/i.test(notificationText(notification))
	if (filter === 'discounts') return /(скид|акци|discount|sale)/i.test(notificationText(notification))
	return true
}

function OrderCard({ order }) {
	const [open, setOpen] = useState(false)
	const statusText = {
		pending: 'Ожидает оплаты',
		paid: 'Оплачен',
		failed: 'Ошибка оплаты',
		cancelled: 'Отменён',
	}[order.status] || order.status
	const typeLabels = {
		game: 'Игра',
		dlc: 'DLC',
		edition: 'Издание',
	}
	const items = order.games || []
	const hasItems = items.length > 0

		return (
			<div
				id={`purchase-${order.id}`}
				className={`purchase ${open ? 'purchase_open' : ''} purchase_${order.status === 'paid' ? 'end' : 'process'}`}
			>
				<div className="purchase__header">
					<div className="purchase__header__bg" />
					<div className="purchase__header__left">
						{hasItems ? (
							<button
								type="button"
								className="purchase__header__button flex-center"
								onClick={() => setOpen((prev) => !prev)}
								aria-expanded={open}
								aria-label={open ? 'Свернуть товары заказа' : 'Показать товары заказа'}
							>
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M9 5l7 7-7 7"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.4"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						) : null}
						<div className="purchase__header__info">
						<div className="purchase__header__info__point txt">
							<div className="purchase__header__info__point__title">ID заказа</div>
							<div className="purchase__header__info__point__value">#{order.id}</div>
						</div>
						<div className="purchase__header__info__point txt">
							<div className="purchase__header__info__point__title">Дата покупки</div>
							<div className="purchase__header__info__point__value">
								{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '-'}
							</div>
							</div>
						<div className="purchase__header__info__point txt">
							<div className="purchase__header__info__point__title">Способ оплаты</div>
							<div className="purchase__header__info__point__value">{order.paymentProvider || '-'}</div>
						</div>
						<div className="purchase__header__info__point txt">
							<div className="purchase__header__info__point__title">Позиций</div>
							<div className="purchase__header__info__point__value">{items.length}</div>
						</div>
						<div className="purchase__header__info__point txt">
							<div className="purchase__header__info__point__title">Итого</div>
							<div className="purchase__header__info__point__value">{order.totalPrice} ₽</div>
						</div>
					</div>
				</div>
				<div className="purchase__header__right">
					<div className="purchase__header__info">
						<div className="purchase__header__info__point purchase__header__info__point_right txt">
							<div className="purchase__header__info__point__title">Статус</div>
							<div className="purchase__header__info__point__value purchase__header__text">{statusText}</div>
						</div>
					</div>
					</div>
			</div>
			{hasItems ? (
				<div className="purchase__gamelist">
					{items.map((game) => (
					<div key={game.id} className="purchase__gamelist__game purchase__gamelist__game_end">
						<div className="purchase__gamelist__game__bg" />
						<div className="purchase__gamelist__game__left">
							<div className="purchase__gamelist__game__title">
								<div className="purchase__gamelist__game__title__img">
									{game.imgH ? <img src={toPublicAsset(game.imgH)} alt="" /> : null}
								</div>
								<div className="purchase__gamelist__game__title__info txt">
									<div className="purchase__gamelist__game__title__info__title">{game.name}</div>
									<div className="purchase__gamelist__game__title__info__type">
										{typeLabels[game.itemType || 'game'] || 'Товар'}
									</div>
									<div className="purchase__gamelist__game__title__info__price">
										<span className="purchase__gamelist__game__title__info__price__new">{game.newPrice} ₽</span>
										{game.oldPrice ? <span className="purchase__gamelist__game__title__info__price__old">{game.oldPrice} ₽</span> : null}
									</div>
								</div>
								</div>
							</div>
							<div className="purchase__gamelist__game__right">
								<div className="purchase__gamelist__game__info">
									<div className="purchase__gamelist__game__info__point purchase__gamelist__game__info__point_right txt">
										<div className="purchase__gamelist__game__info__point__title">Статус</div>
										<div className="purchase__gamelist__game__info__point__value purchase__gamelist__game__text">{statusText}</div>
									</div>
							</div>
						</div>
					</div>
					))}
				</div>
			) : null}
		</div>
	)
}

export default function ProfilePage() {
	const router = useRouter()
	const {
		user,
		authLoading,
		favoriteGames,
		basketGames,
		storedNotifications,
		markNotificationViewed,
		markAllNotificationsViewed,
		logout,
		updateProfile,
	} = useShop()
	const [orders, setOrders] = useState([])
	const [ordersLoading, setOrdersLoading] = useState(false)
	const [steamTradeLink, setSteamTradeLink] = useState('')
	const [username, setUsername] = useState('')
	const [message, setMessage] = useState('')
	const [notificationFilter, setNotificationFilter] = useState('all')

	useEffect(() => {
		if (!user) return
		setSteamTradeLink(user.steamTradeLink || '')
		setUsername(user.username || '')
		setOrdersLoading(true)
		fetch('/api/orders')
			.then((res) => res.json())
			.then((data) => setOrders(data.orders || []))
			.catch(() => setOrders([]))
			.finally(() => setOrdersLoading(false))
	}, [user])

	const libraryGames = useMemo(() => user?.library || [], [user])
	const filteredNotifications = useMemo(
		() => storedNotifications.filter((notification) => notificationMatchesFilter(notification, notificationFilter)),
		[storedNotifications, notificationFilter]
	)
	const unviewedNotifications = useMemo(
		() => storedNotifications.filter((notification) => !notification.viewed),
		[storedNotifications]
	)

	if (authLoading) {
		return <main id="main" className="inner inner_profile txt">Загрузка профиля...</main>
	}

	if (!user) {
		return (
			<main id="main" className="inner inner_profile">
				<section className="profile profileAuthState txt">
					<h1>Профиль</h1>
					<p>Войдите или зарегистрируйтесь, чтобы сохранять корзину, избранное и историю заказов.</p>
					<div className="profileAuthState__actions">
						<Link href="/login" className="settings__buttons__button settings__buttons__button_save txt">Войти</Link>
						<Link href="/register" className="settings__buttons__button settings__buttons__button_back txt">Регистрация</Link>
					</div>
				</section>
			</main>
		)
	}

	const save = async () => {
		setMessage('')
		try {
			await updateProfile({ username, steamTradeLink })
			setMessage('Профиль сохранён')
		} catch (error) {
			setMessage(error.message)
		}
	}

	return (
		<main id="main">
			<div className="inner inner_profile">
				<div className="topic">
					<section className="profile">
						<div className="profile__top">
							<div className="profile__left">
								<div className="profile__avatar">
									{user.avatar ? <img src={toPublicAsset(user.avatar)} alt="" /> : <img src="/img/icons/main/user64.png" alt="" />}
								</div>
								<div className="profile__info">
									<div className="profile__info__nickname txt">
										<span>{user.username}</span>
									</div>
									<div className="profile__info__points">
										<div className="profile__info__points__point txt"><span>ID:</span>#{user.id}</div>
										<div className="profile__info__points__point txt"><span>Email:</span>{user.email}</div>
										<div className="profile__info__points__point txt"><span>Регистрация:</span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-'}</div>
									</div>
								</div>
							</div>
							<div className="profile__right">
								<button className="settings__buttons__button settings__buttons__button_back txt" type="button" onClick={async () => {
									await logout()
									router.push('/login')
								}}>
									Выйти
								</button>
							</div>
						</div>
						<section className="settings">
							<form className="txt" action="" name="form_profile" onSubmit={(event) => event.preventDefault()}>
								<div className="settings__left">
									<div className="settings__conf">
										<label htmlFor="profile_username"><span>Никнейм</span></label>
										<input className="txt" id="profile_username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
									</div>
									<div className="settings__conf">
										<label htmlFor="profile_trade_link"><span>Steam trade link</span></label>
										<input
											className="txt"
											id="profile_trade_link"
											type="url"
											value={steamTradeLink}
											onChange={(event) => setSteamTradeLink(event.target.value)}
											placeholder="https://steamcommunity.com/tradeoffer/new/..."
										/>
									</div>
								</div>
								<div className="settings__right">
									<div className="settings__buttons">
										<button className="settings__buttons__button settings__buttons__button_save txt" type="button" onClick={save}>Сохранить</button>
									</div>
									{message ? <p className="txt profileMessage">{message}</p> : null}
								</div>
							</form>
						</section>
						</section>
						<section className="pNotification profileNotifications" id="profile_notification">
							<div className="pNotification__header">
								<div className="pNotification__header__top">
									<div className="pNotification__header__title txt">Уведомления</div>
									<div className="pNotification__header__actions">
										<button
											type="button"
											className="pNotification__header__filter__point pNotification__header__filter__point_readAll"
											onClick={markAllNotificationsViewed}
											disabled={!unviewedNotifications.length}
										>
											Прочитать все
										</button>
										<div className="pNotification__header__counter txt">{storedNotifications.length}</div>
									</div>
								</div>
								<div className="pNotification__header__filter txt">
									{NOTIFICATION_FILTERS.map((filter) => (
										<button
											key={filter.id}
											type="button"
											className={`pNotification__header__filter__point ${
												notificationFilter === filter.id ? 'pNotification__header__filter__point_active' : ''
											}`}
											onClick={() => setNotificationFilter(filter.id)}
										>
											{filter.title}
										</button>
									))}
								</div>
							</div>
							<div className="pNotification__grid" id="profile_notification_grid">
								{filteredNotifications.length === 0 ? (
									<div className="pNotification__grid__nothing flex-center txt">Нет уведомлений</div>
								) : (
									filteredNotifications.map((notification) => (
										<button
											key={notification.id}
											type="button"
											className={`pNotification__grid__notification notification_${notification.status} ${
												notification.viewed ? '' : 'pNotification__grid__notification_new'
											}`}
											onClick={() => markNotificationViewed(notification.id)}
										>
											<span className="pNotification__grid__notification__point">
												<span
													className={`pNotification__grid__notification__point__circle ${
														notification.status === 'error' || notification.status === 'false'
															? 'pNotification__grid__notification__point__circle_error'
															: ''
													}`}
												/>
											</span>
											<span
												className="pNotification__grid__notification__text txt"
												dangerouslySetInnerHTML={{ __html: notification.message }}
											/>
										</button>
									))
								)}
							</div>
						</section>
					</div>
				<section className="more">
					<div className="more__header">
						<div className="more__header__nav more__header__nav_active"><div className="more__header__nav__text txt">История покупок</div></div>
						<Link href="/favorite" className="more__header__nav"><div className="more__header__nav__text txt">Избранное</div></Link>
						<Link href="/basket" className="more__header__nav"><div className="more__header__nav__text txt">Корзина</div></Link>
					</div>
					<section className="more__section more__section_active">
						{ordersLoading ? <p className="txt shop-state">Загрузка заказов...</p> : null}
						{!ordersLoading && orders.length === 0 ? <p className="txt shop-state">История заказов пока пустая.</p> : null}
						{orders.map((order) => <OrderCard key={order.id} order={order} />)}
					</section>
					{libraryGames.length ? (
						<section className="profileLinkedGames">
							<h2 className="txt">Библиотека</h2>
							<div className="games__grid griding_4InRow">
								{libraryGames.map((game) => <GameCardH key={game.id} game={game} />)}
							</div>
						</section>
					) : null}
					{favoriteGames.length ? (
						<section className="profileLinkedGames">
							<h2 className="txt">Избранное</h2>
							<div className="games__grid griding_4InRow">
								{favoriteGames.slice(0, 4).map((game) => <GameCardH key={game.id} game={game} />)}
							</div>
						</section>
					) : null}
					{basketGames.length ? (
						<section className="profileLinkedGames">
							<h2 className="txt">Корзина</h2>
							<div className="games__grid griding_4InRow">
								{basketGames.slice(0, 4).map((game) => <GameCardH key={game.id} game={game} />)}
							</div>
						</section>
					) : null}
				</section>
			</div>
		</main>
	)
}
