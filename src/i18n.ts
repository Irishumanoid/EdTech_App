import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'fr', 'ja', 'de', 'ru', 'es', 'fa', 'ar']
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()
  
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return { messages };
  } catch (err) {
    console.error(`Error loading messages for locale ${locale}`, err);
    notFound()
  }
})
