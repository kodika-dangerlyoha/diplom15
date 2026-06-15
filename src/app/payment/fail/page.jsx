'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function FailInner() {
	const searchParams = useSearchParams()
	const orderId = searchParams.get('orderId')
	const [status, setStatus] = useState('Платёж не был завершён.')

	useEffect(() => {
		if (!orderId) return
		fetch('/api/payment/cancel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderId, status: 'failed' }),
		})
			.then(() => setStatus('Статус заказа сохранён как ошибка оплаты. Корзина не очищена.'))
			.catch(() => setStatus('Платёж не был завершён. Корзина не очищена.'))
	}, [orderId])

	return (
		<main id="main" className="inner inner_profile txt">
			<section className="profile paymentResult">
				<h1>Оплата не прошла</h1>
				<p>{status}</p>
				<Link href="/checkout" className="settings__buttons__button settings__buttons__button_save txt">Вернуться к оплате</Link>
			</section>
		</main>
	)
}

export default function PaymentFailPage() {
	return (
		<Suspense fallback={<main className="inner txt">Загрузка...</main>}>
			<FailInner />
		</Suspense>
	)
}
