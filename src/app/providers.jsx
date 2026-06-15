'use client'

import { ShopProvider } from '@/context/ShopContext'

export default function Providers({ children }) {
	return <ShopProvider>{children}</ShopProvider>
}
