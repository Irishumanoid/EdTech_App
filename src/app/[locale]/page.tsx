import { useTranslations } from 'next-intl'
import Button from './components/Button'

export default function DashboardPage() {
  const t = useTranslations('')
  return (
    <div>
      <section className='flex flex-col items-center justify-center py-24'>
        <h1 className='text-center text-7xl font-extrabold leading-tight'>
          {t('Audio')}{' '}
          <span className='bg-span-bg bg-clip-text text-transparent'>
            {t('Personalized')}
          </span>
          <br />
          {t('Lang_dev_platform')}
        </h1>
        <div className='my-6 px-20 text-center text-2xl text-text-secondary'>
          {t('Learning_fun_and_customizable')}
        </div>
        <div className='mt-4 flex flex-row gap-4'>
          <a
            href='https://www.duolingo.com/'
            target='_blank'
          >
            <Button rounded size='large'>
              {t('Resources')}
            </Button>
          </a>
          <a
            href='https://www.duolingo.com/'
            target='_blank'
          >
            <Button rounded size='large' variant='secondary'>
              {t('Our_mission')}
            </Button>
          </a>
        </div>
      </section>
      <section className='bg-background-secondary py-20 max-lg:py-10'>
        <div className='mx-auto grid max-w-screen-lg grid-cols-3 gap-7 px-8 py-5 max-lg:max-w-fit max-lg:grid-cols-1 max-lg:gap-10'>
          <div className='text-center'>
            <h2 className='mb-3  text-xl font-semibold'>{t('Approachable')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t('Easy_to_use_interface')}
            </p>
          </div>
          <div className='text-center'>
            <h2 className='mb-3 text-xl font-semibold'>{t('Engaging')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t('Content_customized_to_preferences')}
            </p>
          </div>
          <div className='text-center'>
            <h2 className='mb-3 text-xl font-semibold'>{t('Innovative')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t('Unique_tailored_content_library')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
