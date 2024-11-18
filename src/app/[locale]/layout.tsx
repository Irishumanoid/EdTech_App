import dotenv from 'dotenv';
dotenv.config();

import { ThemeProvider } from '@/src/app/[locale]/components/ThemeProvider'
import type { Metadata } from 'next'
import {
  AbstractIntlMessages,
  NextIntlClientProvider,
  useMessages
} from 'next-intl'
import { Inter, Rubik, Space_Grotesk } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { Header } from './components/Header'
import './globals.css'
import Head from 'next/head'
import ClientWrapper from './ClientWrapper'

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter'
})
const rubik = Rubik({
  subsets: ['arabic'],
  variable: '--rubik'
})
const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})
export const metadata: Metadata = {
  title: 'Next Temp',
  description: 'create next app!'
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = useMessages()
  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${space_grotesk.variable} ${rubik.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
          <ThemeProvider
            enableSystem
            attribute="class"
            defaultTheme="light"
            themes={[
              'light',
              'dark',
              'instagram',
              'facebook',
              'discord',
              'netflix',
              'twilight',
              'reddit'
            ]}
          >
            <NextIntlClientProvider
              locale={locale}
              messages={messages as AbstractIntlMessages}
            >
              <ClientWrapper>
                <NextTopLoader
                  initialPosition={0.08}
                  crawlSpeed={200}
                  height={3}
                  crawl={true}
                  easing="ease"
                  speed={200}
                  shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                  color="var(--primary)"
                  showSpinner={false}
                />
                <Header locale={locale} />
                <main className="mx-auto max-w-screen-2xl"></main>
              {children}
            </ClientWrapper>
            </NextIntlClientProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
