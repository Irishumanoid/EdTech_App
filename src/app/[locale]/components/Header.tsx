'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import { usePathname } from 'next/navigation';
interface Props {
  locale: string
}
export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('');
  const pathname = usePathname();
  const relDir = pathname.split('/')[pathname.split('/').length - 1];

  return (
    <div className='mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-2'>
      <Link lang={locale} href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          {relDir !== 'dashboard' && <strong className='mx-2 select-none'>Home</strong>}
        </div>
      </Link>
      <div className='flex flex-row items-center gap-3'>
        <nav className='mr-10 inline-flex gap-5'>
          {relDir !== 'dashboard' && 
            <div className='flex flex-row items-center gap-3'>
              <Link lang={locale} href={`/login`}>
                {t('Login')}
              </Link>
              <Link lang={locale} href={`/register`}>
                {t('Register')}
              </Link>
              <Link lang={locale} href={`/home`}> 
                {t('Try_it_out')}
              </Link>
            </div>
          }
          {relDir == 'dashboard' && 
            <div className='flex flex-row items-center gap-3'>
              <Link lang={locale} href={`/`}> 
                {t('Logout')}
              </Link>
            </div>
          }
        </nav>
        <ThemeSwitch />
        <LangSwitcher />
      </div>
    </div>
  )
}
