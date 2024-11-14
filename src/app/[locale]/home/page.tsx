'use client'

import { useState } from 'react'
import * as React from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';


import { useAppDispatch, useAppSelector } from  '../../store/hooks';
import { setContentType } from '../../store/features/userStorySlice';
import Button from '../components/Button';
import { ChildInfo } from '../components/ChildInfo';

//on submit, add everything to gptprompt object
export default function Home() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    const handleUpdate = () => {
        
    }

    return (
        <div className='px-32 py-10 text-center text-2xl font-bold'>
            <label>User preferences</label>
            <Box sx={{
                display: 'flex',          
                justifyContent: 'center', 
                alignItems: 'center',     
                height: '80vh',         
                padding: 0,               
            }}>
                <Box sx={{
                    height: 500,
                    width: 1200,
                    backgroundColor: '#f9f9f9',
                    padding: 'rem',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                    }}>
                    <ChildInfo index={0} />
                    <ChildInfo index={1} />
                    <ChildInfo index={2} />

                    <Button rounded size='large' onClick={handleUpdate}>
                        Generate
                    </Button>
                </Box>  
            </Box>
        </div>
    );
}