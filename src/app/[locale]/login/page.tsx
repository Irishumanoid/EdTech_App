'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';
import Button from '../components/Button';
import { useRouter } from '@/src/navigation';

export default function Login() {
  const t = useTranslations('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
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


      if ([passwordError, emailError].every(e => e === '')) {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          setMessage(data.message.toString());
          // make sure it doesn't move on if user doesn't exist
          console.log(`status code ${ response.status}`);
          if (response.ok && response.status === 200) { 
            router.push('/home');
          }
        } catch (err) {
          console.error('Error occurred: ', err);
          setMessage(`An error occurred: ${err}`);
        }
      }
    }
  

  return (
    <div className='px-32 py-24 text-center text-2xl'>
      <div className='text-center'>
      </div>
        <Box
          sx={{
            height: 400,
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
            <TextField id="outlined-basic" label="Password" variant="outlined" onChange={(e) => setPassword(e.target.value)}/>
            <br/>
            <label style={{ color: 'red', fontSize: '12px' }}>{passwordError}</label>
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
