import Header from '@/components/Header'
import Providers from '@/app/providers'
import './styles/css/main.min.css'
import './app-shell.css'
import './swor-overrides.css'
import Footer from '@/components/Footer'

export const metadata = {
    title: '+W Store',
    description: 'Купить игры по лучшим ценам',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ru" data-scroll-behavior="smooth">
            <body>
                <Providers>
                    <div className="app-shell">
                        <Header />
                        <div className="app-shell__main">{children}</div>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    )
}
