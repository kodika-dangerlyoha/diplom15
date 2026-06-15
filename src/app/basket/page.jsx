'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShop } from '@/context/ShopContext'
import LineGameRow from '@/components/LineGameRow'

const banks = [
	{ id: '00001', label: 'Мир', img: '/img/icons/banks/mir.svg' },
	{ id: '00002', label: 'Visa', img: '/img/icons/banks/visa.svg' },
	{ id: '00004', label: 'ЮKassa', img: '/img/icons/banks/ukassa.svg' },
	{ id: '00005', label: 'Mastercard', img: '/img/icons/banks/mc.svg' },
]

export default function BasketPage() {
	const router = useRouter()
	const { basketGames, user } = useShop()
	const [tradeLink, setTradeLink] = useState('')
	const [email, setEmail] = useState('')
	const [promo, setPromo] = useState('')
	const [bankId, setBankId] = useState('')
	const [agree, setAgree] = useState(false)
	const [paymentOpen, setPaymentOpen] = useState(false)
	const [errors, setErrors] = useState({})
	const [tradeHelp, setTradeHelp] = useState(false)

	const empty = basketGames.length === 0

	const totals = useMemo(() => {
		const newP = basketGames.reduce((a, g) => a + (Number(g.newPrice) || 0), 0)
		const oldP = basketGames.reduce((a, g) => a + (Number(g.oldPrice) || 0), 0)
		const discount = oldP > 0 ? Math.round(((oldP - newP) / oldP) * 100) : 0
		return { newP, oldP, discount }
	}, [basketGames])

	const goBuy = (e) => {
		e.preventDefault()
		const err = {}
		if (!tradeLink.trim()) err.trade_link = 'Укажите трейд ссылку'
		if (!email.trim()) err.email = 'Укажите Email'
		if (!bankId) err.paymentMethod = 'Выберите способ оплаты'
		if (!agree) err.checkBox = 'Согласитесь с Условиями и политикой конфиденциальности'
		if (promo.trim() && promo.trim().toLowerCase() !== 'demo') {
			err.promocode = 'Недействительный промокод'
		}
		setErrors(err)
		if (Object.keys(err).length) return
		if (!user) {
			router.push('/login')
			return
		}
		router.push('/checkout')
	}

	return (
		<main id="main">
			<div className="inner inner_basket">
				<div className={`basketContainer ${empty ? 'basketContainer_empty' : ''}`} id="basket_container">
					<div className="basketContainer__gameList" id="basket_gameList">
						<h2 className="basketContainer__h2 txt">Корзина</h2>
						<div className="lineGames" id="basket_games_list">
							{basketGames.map((game) => (
								<LineGameRow key={game.id} game={game} mode="basket" />
							))}
						</div>
					</div>
					<div className="basketContainer__info" id="basket_info">
						<h2 className="basketContainer__h2 txt" id="basketInfo_h2">
							Итого
						</h2>
						<div className="basketContainer__info__totalBlock">
							<form
								className="basketContainer__info__totalBlock__basketBlock"
								action=""
								name="buy"
								onSubmit={goBuy}
							>
								<div className="for-input">
									<input
										type="text"
										className="def-input txt"
										placeholder="Трейд ссылка"
										name="input_tradeLink"
										value={tradeLink}
										onChange={(ev) => {
											setTradeLink(ev.target.value)
											if (errors.trade_link) setErrors((x) => ({ ...x, trade_link: '' }))
										}}
									/>
									<div className="for-input__questionIconBlock">
										<div
											className="for-input__questionIconBlock__icon flex-center txt"
											onMouseEnter={() => setTradeHelp(true)}
											onMouseLeave={() => setTradeHelp(false)}
										>
											?
										</div>
									</div>
									<div
										className="for-input__notification for-input__notification_gray"
										id="notification_gray"
										style={{ visibility: tradeHelp ? 'visible' : 'hidden' }}
									>
										<div className="for-input__notification__heading txt">Ваша трейд-ссылка в Steam</div>
										<div className="for-input__notification__info txt">
											Ваш профиль &gt; Инвентарь &gt; предложения обмена &gt; Кто может отправлять мне предложения обмена?
										</div>
										<div className="for-input__notification__triangleForm for-input__notification__triangleForm_gray" />
										<div className="for-input__notification__hideTriangle" />
									</div>
									{errors.trade_link ? (
										<div className="for-input__notification for-input__notification_trade_link" style={{ visibility: 'visible' }}>
											<div className="for-input__notification__heading txt">{errors.trade_link}</div>
											<div className="for-input__notification__triangleForm" />
											<div className="for-input__notification__hideTriangle" />
										</div>
									) : null}
								</div>
								<div className="for-input">
									<input
										type="email"
										className="def-input txt"
										placeholder="Email"
										name="input_email"
										value={email}
										onChange={(ev) => {
											setEmail(ev.target.value)
											if (errors.email) setErrors((x) => ({ ...x, email: '' }))
										}}
									/>
									{errors.email ? (
										<div className="for-input__notification for-input__notification_email" style={{ visibility: 'visible' }}>
											<div className="for-input__notification__heading txt">{errors.email}</div>
											<div className="for-input__notification__triangleForm" />
											<div className="for-input__notification__hideTriangle" />
										</div>
									) : null}
								</div>
								<input type="hidden" name="bank_id" value={bankId} readOnly />
								<div
									className={`basketContainer__info__totalBlock__paymentMethods ${
										paymentOpen ? 'basketContainer__info__totalBlock__paymentMethods_active' : ''
									}`}
								>
									<button
										type="button"
										className="basketContainer__info__totalBlock__paymentMethods__header"
										onClick={() => setPaymentOpen((o) => !o)}
									>
										<div className="basketContainer__info__totalBlock__paymentMethods__header__title txt" id="text_pay_method">
											{bankId ? banks.find((b) => b.id === bankId)?.label : 'Способ оплаты'}
										</div>
										<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
												fill="#fff"
											/>
										</svg>
									</button>
									<div className="basketContainer__info__totalBlock__paymentMethods__body">
										{banks.map((b) => (
											<button
												key={b.id}
												type="button"
												id={`bank_${b.id}`}
												className={`basketContainer__info__totalBlock__paymentMethods__body__bank ${
													bankId === b.id ? 'basketContainer__info__totalBlock__paymentMethods__body__bank_active' : ''
												}`}
												onClick={() => {
													setBankId(b.id)
													setPaymentOpen(false)
													if (errors.paymentMethod) setErrors((x) => ({ ...x, paymentMethod: '' }))
												}}
											>
												<img src={b.img} alt={b.label} />
											</button>
										))}
									</div>
								</div>
								{errors.paymentMethod ? (
									<div className="for-input__notification for-input__notification_paymentMethod" style={{ visibility: 'visible' }}>
										<div className="for-input__notification__heading txt">{errors.paymentMethod}</div>
										<div className="for-input__notification__triangleForm" />
										<div className="for-input__notification__hideTriangle" />
									</div>
								) : null}
								<div className="for-input">
									<input
										type="text"
										className="def-input txt"
										placeholder="Промокод"
										name="input_promocode"
										value={promo}
										onChange={(ev) => {
											setPromo(ev.target.value)
											if (errors.promocode) setErrors((x) => ({ ...x, promocode: '' }))
										}}
									/>
									{errors.promocode ? (
										<div className="for-input__notification for-input__notification_promocode" style={{ visibility: 'visible' }}>
											<div className="for-input__notification__heading txt">{errors.promocode}</div>
											<div className="for-input__notification__triangleForm" />
											<div className="for-input__notification__hideTriangle" />
										</div>
									) : null}
								</div>
								<div className="basketContainer__info__totalBlock__calcPrice">
									<div className="basketContainer__info__totalBlock__calcPrice__oldPrice">
										<div className="basketContainer__info__totalBlock__calcPrice__oldPrice__this txt">Оффициальная цена</div>
										<div className="basketContainer__info__totalBlock__calcPrice__oldPrice__value txt" id="basket_oldPrice">
											{totals.oldP} ₽
										</div>
									</div>
									<div className="basketContainer__info__totalBlock__calcPrice__discount">
										<div className="basketContainer__info__totalBlock__calcPrice__discount__this txt">Скидка</div>
										<div className="basketContainer__info__totalBlock__calcPrice__discount__value txt" id="basket_discount">
											{totals.discount}%
										</div>
									</div>
								</div>
								<div className="basketContainer__info__totalBlock__totalPrice txt">
									<div className="basketContainer__info__totalBlock__totalPrice__this txt">Сумма к оплате</div>
									<div className="basketContainer__info__totalBlock__totalPrice__value txt" id="basket_newPrice">
										{totals.newP} ₽
									</div>
								</div>
								<button type="submit" className="basketContainer__info__totalBlock__buyButton">
									<div className="basketContainer__info__totalBlock__buyButton__text txt">Перейти к оплате</div>
									<div className="basketContainer__info__totalBlock__buyButton__forHover absolute-zero" />
								</button>
								<div className="basketContainer__info__totalBlock__agreeBlock">
									<button
										type="button"
										className={`basketContainer__info__totalBlock__agreeBlock__checkBox ${
											agree ? 'basketContainer__info__totalBlock__agreeBlock__checkBox_active' : ''
										}`}
										onClick={() => {
											setAgree((a) => !a)
											if (errors.checkBox) setErrors((x) => ({ ...x, checkBox: '' }))
										}}
									>
										<div className="basketContainer__info__totalBlock__agreeBlock__checkBox__checkMark" id="basket_checkMark">
											<img src="/img/icons/main/check16.png" alt="" />
										</div>
									</button>
									<div className="basketContainer__info__totalBlock__agreeBlock__label txt">
										Я согласен с Условиями и <a href="#">политикой конфиденциальности</a>
									</div>
								</div>
								{errors.checkBox ? (
									<div className="txt" style={{ color: '#f88', marginTop: 8 }}>
										{errors.checkBox}
									</div>
								) : null}
							</form>
						</div>
						<Link href="/" className="basketContainer__info__exitButton txt" id="exit_button">
							Вернуться к покупкам
						</Link>
					</div>
					<div className="basketContainer__empty txt">
						<span>Вы еще не добавили ни одну игру в корзину</span>
						<Link href="/">Перейти на главную страницу</Link>
					</div>
				</div>
			</div>
		</main>
	)
}
