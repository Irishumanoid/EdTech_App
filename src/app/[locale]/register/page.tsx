"use client";

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';
import Button from '../components/Button';
import { useRouter } from '@/src/navigation';

export default function Register() {
  const t = useTranslations('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [passwordConfError, setPasswordConfError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleClick = async () => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      if (email === '') {
        setEmailError('Please enter your email');
      } else {
        setEmailError('Please enter a valid email');
      }
    } else {
      setEmailError('');
    }

    if (password === '') {
      setPasswordError('Please enter a valid password');
    } else {
      setPasswordError('');
    }

    if (passwordConf != password) {
      setPasswordConfError('Please enter matching passwords');
    } else {
      setPasswordConfError('');
    }

    if ([passwordError, passwordConfError, emailError].every(e => e === '')) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await response.json();
        // make sure it doesn't move on if identical user exists
        setMessage(data.message);
        if (response.ok && !data.message?.toString().includes('User already exists')) { 
          router.push('/home');
        }
      } catch (err) {
        console.error('Error occurred: ', err);
      }
    }
  }

  return (
    <div className='px-32 py-24 text-center text-2xl'>
      <div className='text-center'>
      </div>
        <Box
          sx={{
            height: 500,
            backgroundColor: '#f9f9f9',
            padding: '4rem',
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          {t('Test')}
          <div className='py-2 text-center'>
            <TextField id="outlined-basic" label="Email" variant="outlined" onChange={(e) => setEmail(e.target.value)}/>
            <br/>
            <label style={{ color: 'red', fontSize: '12px' }}>{emailError}</label>
          </div>
          <div className='py-2 text-center'>
            <TextField id="outlined-basic" label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)}/>
          </div>
          <div className='py-2 text-center'>
            <TextField id="outlined-basic" label="Password" variant="outlined" onChange={(e) => setPassword(e.target.value)}/>
            <br/>
            <label style={{ color: 'red', fontSize: '12px' }}>{passwordError}</label>
          </div>
          <div className='py-2 text-center'>
            <TextField id="outlined-basic" label="Confirm Password" variant="outlined" onChange={(e) => setPasswordConf(e.target.value)}/>
            <br/>
            <label style={{ color: 'red', fontSize: '12px' }}>{passwordConfError}</label>
          </div>
          <label style={{color: 'red', fontSize: '14px'}}>{message}</label>
          <br/>
          <Button rounded size='large' variant='primary' onClick={() => handleClick()}>
            {t('click')}
          </Button>
        </Box>
    </div>
  )
}
