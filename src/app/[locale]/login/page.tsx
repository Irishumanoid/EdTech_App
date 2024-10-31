'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function About() {
  const t = useTranslations('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (clicked) {
      // login behavior
    }
  }, [clicked]);

  return (
    <div className='px-32 py-24 text-center text-2xl'>
      <div className='text-center'>
        {t('Test')}
      </div>
        <div>
          <TextField id="outlined-basic" label="Email" variant="outlined" />
        </div>
        <div>
          <TextField id="outlined-basic" label="Password" variant="outlined" />
        </div>
        <Button
          variant="contained"
          href="#contained-buttons"
          onClick={() => setClicked(true)}
          style={{ height: '50px' }} 
          >
          Login
        </Button>
    </div>
  )
}
