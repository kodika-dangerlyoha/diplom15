'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useShop } from '@/context/ShopContext'
import LineGameRow from '@/components/LineGameRow'

export default function CheckoutPage() {
	const router = useRouter()
	const { user, basketGames, basketTotal } = useShop()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const discount = useMemo(() => {
		const full = basketGames.reduce((sum, game) => sum + (Number(game.oldPrice) || Number(game.newPrice) || 0), 0)
		return full > 0 ? Math.round(((full - basketTotal) / full) * 100) : 0
	}, [basketGames, basketTotal])

	const pay = async () => {
		setError('')
		setLoading(true)
		try {
			const res = await fetch('/api/payment/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameIds: basketGames.map((game) => game.id),
					items: basketGames,
					paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'mock',
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Не удалось начать оплату')
			if (data.widget?.redirectUrl) {
				router.push(data.widget.redirectUrl)
				return
			}
			if (data.paymentUrl) {
				window.location.href = data.paymentUrl
				return
			}
			router.push(`/payment/success?orderId=${data.order?.id || ''}`)
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	if (!user) {
		return (
			<main id="main" className="inner inner_profile txt">
				<h1>Оформление заказа</h1>
				<p>Для оплаты нужно войти в аккаунт.</p>
				<Link href="/login" className="settings__buttons__button settings__buttons__button_save txt">Войти</Link>
			</main>
		)
	}

	return (
		<main id="main">
			<div className="inner inner_basket">
				<section className="checkoutPage">
					<div className="checkoutPage__left">
						<h1 className="txt">Оформление заказа</h1>
						<div className="lineGames">
							{basketGames.map((game) => <LineGameRow key={game.id} game={game} mode="basket" />)}
						</div>
						{basketGames.length === 0 ? <p className="txt shop-state">Корзина пустая.</p> : null}
					</div>
					<aside className="checkoutPage__widget txt">
						<h2>Payment widget</h2>
						<div className="checkoutPage__widget__row"><span>Провайдер</span><b>{process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'mock'}</b></div>
						<div className="checkoutPage__widget__row"><span>Скидка</span><b>{discount}%</b></div>
						<div className="checkoutPage__widget__row checkoutPage__widget__row_total"><span>К оплате</span><b>{basketTotal} ₽</b></div>
						<p>Dev-виджет не собирает и не хранит платёжные данные. Реальный провайдер подключается через Strapi payment service и `.env`.</p>
						{error ? <p className="shop-state shop-state_error">{error}</p> : null}
						<button className="basketContainer__info__totalBlock__buyButton" type="button" disabled={loading || basketGames.length === 0} onClick={pay}>
							<div className="basketContainer__info__totalBlock__buyButton__text txt">{loading ? 'Создание платежа...' : 'Оплатить'}</div>
							<div className="basketContainer__info__totalBlock__buyButton__forHover absolute-zero" />
						</button>
					</aside>
				</section>
			</div>
		</main>
	)
}
