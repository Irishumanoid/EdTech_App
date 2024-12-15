import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useState, useEffect } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { useAppDispatch } from  '../../store/hooks';
import { addUser, modifyUser, removeUser } from '../../store/features/userStorySlice';
import { IconButton } from '@mui/material';

interface ChildInfoProps {
    index: number;
    isMain: boolean;
    onDelete: (index: number) => void;
}

export const ChildInfo = ({ index, isMain, onDelete }: ChildInfoProps) => {
    const [name, setName] = useState('');
    const [pronoun, setPronoun] = useState('');
    const [prefs, setPrefs] = useState('');

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(addUser({name: '', pronoun: '', preferences: []}));
    }, []);


    useEffect(() => {
        if (name || pronoun || prefs) {
            dispatch(modifyUser({index: index, name: name, pronoun: pronoun, preferences: prefs.split(',')}));
        }
    }, [name, pronoun, prefs]);

    const deleteUser = () => {
        dispatch(removeUser({index}));
        onDelete(index);
    }

    return (
        <Box paddingLeft={isMain ? 0 : 8}>
            <Box sx={{ '& > :not(style)': { m: 1 } }} id={`child-info-${index}`}>
                <TextField
                    id="input-with-icon-textfield"
                    label={index === 0 ? "Child name" : `Person ${index} name`}
                    sx={{ position: 'relative', top: '30px', backgroundColor: 'var(--background)' }}
                    slotProps={{
                    input: {
                        startAdornment: (
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                        ),
                    },
                    }}
                    variant="standard"
                    onChange={(e) => setName(e.target.value)}
                />
                <FormControl>
                    <FormLabel id='demo-radio-buttons-group-label'>Pronouns</FormLabel>
                    <RadioGroup defaultValue='female' name='radio-buttons-group' onChange={(e) => setPronoun(e.target.value)}>
                        <FormControlLabel value='she' control={<Radio />} label='she/her' />
                        <FormControlLabel value='he' control={<Radio />} label='he/him' />
                        <FormControlLabel value='they' control={<Radio />} label='they/them' />
                    </RadioGroup>
                </FormControl>
                <TextField
                    id="standard-multiline-flexible"
                    label="Preferences"
                    multiline
                    minRows={4}
                    maxRows={4}
                    variant="standard"
                    onChange={(e) => setPrefs(e.target.value)}
                    sx = {{
                        width:'500px',
                        position: 'relative', 
                        top: '20px',
                        backgroundColor: 'var(--background)',
                        textEmphasisColor: 'var(--button-text)',
                    }}
                />   
                {!isMain &&
                    <IconButton 
                        color="primary" 
                        aria-label="delete" 
                        onClick={() => deleteUser()}
                        sx={{position: 'relative', top: '50px'}}>
                            <DeleteForeverIcon sx={{color: 'red', fontSize: 30}}/>
                    </IconButton>
                }
            </Box>
        </Box>
    );
}