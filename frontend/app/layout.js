import './globals.css'
import Navbar from '../components/Navbar'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'
import ThemeProvider from '../components/ThemeProvider'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: 'Campus Cart — BTech Student Marketplace',
  description: 'Buy & Sell Workshop Essentials for Less',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Topbar />
            <Navbar />
            <main>
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
