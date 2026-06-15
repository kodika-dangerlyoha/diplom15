'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShop } from '@/context/ShopContext'

export default function AuthForm({ mode }) {
	const router = useRouter()
	const { login, register } = useShop()
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const isRegister = mode === 'register'

	const submit = async (event) => {
		event.preventDefault()
		setError('')
		setSubmitting(true)
		try {
			if (isRegister) await register({ username, email, password })
			else await login({ identifier: email, password })
			router.push('/profile')
		} catch (err) {
			setError(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<main id="main" className="inner inner_profile">
			<section className="profile authPage">
				<h1 className="txt">{isRegister ? 'Регистрация' : 'Вход'}</h1>
				<form className="authPage__form" onSubmit={submit}>
					{isRegister ? (
						<input className="def-input txt" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Никнейм" required />
					) : null}
					<input className="def-input txt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
					<input className="def-input txt" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required minLength={6} />
					{error ? <p className="txt shop-state shop-state_error">{error}</p> : null}
					<button className="settings__buttons__button settings__buttons__button_save txt" type="submit" disabled={submitting}>
						{submitting ? 'Отправка...' : isRegister ? 'Создать аккаунт' : 'Войти'}
					</button>
				</form>
				<Link href={isRegister ? '/login' : '/register'} className="txt authPage__link">
					{isRegister ? 'Уже есть аккаунт' : 'Создать аккаунт'}
				</Link>
			</section>
		</main>
	)
}
