'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useShop } from '@/context/ShopContext'

function SuccessInner() {
	const searchParams = useSearchParams()
	const { refreshUser, clearBasketState } = useShop()
	const orderId = searchParams.get('orderId')
	const [status, setStatus] = useState('Подтверждаем оплату...')

	useEffect(() => {
		if (!orderId) {
			setStatus('Оплата завершена.')
			return
		}
		fetch('/api/payment/confirm', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderId }),
		})
			.then((res) => res.json().then((data) => ({ ok: res.ok, data })))
			.then(({ ok, data }) => {
				if (!ok) throw new Error(data.error || 'Не удалось подтвердить оплату')
				clearBasketState()
				refreshUser()
				setStatus('Заказ оплачен. Игры добавлены в библиотеку.')
			})
			.catch((error) => setStatus(error.message))
	}, [orderId, refreshUser, clearBasketState])

	return (
		<main id="main" className="inner inner_profile txt">
			<section className="profile paymentResult">
				<h1>Оплата успешна</h1>
				<p>{status}</p>
				<Link href="/profile" className="settings__buttons__button settings__buttons__button_save txt">В профиль</Link>
			</section>
		</main>
	)
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={<main className="inner txt">Загрузка...</main>}>
			<SuccessInner />
		</Suspense>
	)
}
