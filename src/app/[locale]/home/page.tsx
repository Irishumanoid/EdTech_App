'use client'
import * as React from 'react';
import Box from '@mui/material/Box';

import { useAppDispatch, useAppSelector } from  '../../store/hooks';
import { setType, setNumMins, setAgeRange as setAges, setOtherInfo, setKeywords, setLanguage, updateUsers, setVoiceGender, setUuid, resetPlots } from '../../store/features/userStorySlice';
import Button from '../components/Button';
import { ChildInfo } from '../components/ChildInfo';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { useEffect, useState } from 'react';
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Slider, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { downloadStory, getBlobUrl } from '@/lib/utils';
import { ProgressStepper, steps } from '../components/ProgressStepper';
 
const minChoices = [1, 2, 5, 10];
//on submit, add everything to gptprompt object
export default function Home() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const [inputList, setInputList] = useState([<ChildInfo index={0} key={0} onDelete={() => userDelete(0)}/>]);
    const [minsStates, setMinsStates] = useState(new Map(Array.from(minChoices).map(choice => [choice, false])));
    const [ageRange, setAgeRange] = useState([0, 18]);
    const [isAudio, setIsAudio] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [storyText, setStoryText] = useState(['']);
    const [gotStory, setGotStory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [entriesVisible, setEntriesVisible] = useState(true);

    // reset to default state when page reloaded
    useEffect(() => {
        dispatch(setType('story'));
        dispatch(setNumMins(1));
        dispatch(setAges([1, 18]));
        dispatch(resetPlots());
        dispatch(setKeywords(false));
        dispatch(setOtherInfo(''));
        dispatch(setLanguage('English'));
        dispatch(setVoiceGender('Female'));
    }, [dispatch]);

    useEffect(() => {
        if (activeStep !== steps.length) {
            setEntriesVisible(true);
        }
    }, [activeStep]);

    const genButtonClick = () => {
        const newIndex = inputList.length;
        setInputList((prevList) => [
            ...prevList,
            <ChildInfo key={newIndex} index={newIndex} onDelete={() => userDelete(newIndex)} />
        ]);
    }

    const userDelete = (index: number) => {
        setInputList((prevList) => {
            const updatedList = prevList.filter((_, i) => i !== index);
            return updatedList.map((child, i) =>
                React.cloneElement(child, { index: i, key: i, onDelete: () => userDelete(i) })
            );
        });
    };

    const handleMinsChange = (input: number) => {
        dispatch(setNumMins(input));
        const keys = minsStates.keys();
        const newMap = new Map(Array.from(minChoices).map(choice => [choice, choice === input]));
        setMinsStates(newMap);
    }

    const handleAgeSliderChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setAgeRange(newValue as [number, number]);
            dispatch(setAges(newValue));
        }
    };

    const getAudio = async (response: Response) => {
        try {
            const audioContext = new window.AudioContext();
            const arrayBuffer = await response.arrayBuffer();
            audioContext.decodeAudioData(arrayBuffer, (decodedData) => {
                setAudioBuffer(decodedData);
                setIsAudio(true);
                setLoading(false);
            });
        } catch (error) {
            console.error('Error decoding audio');
        }
    }

    //fetch everything from user object and generate story
    const handleUpdate = async (audioGen: boolean) => {
        setEntriesVisible(false);
        setLoading(true);
        if (isAudio) {
            setIsAudio(false);
        }

        if (!audioGen) {
            setStoryText([]);
            const updatedUsers = user.users.filter((curUser) => 
                !(curUser.name === "" && curUser.preferences.length === 0 && curUser.pronoun === "")
            );
            
            dispatch(updateUsers({users: updatedUsers}));  
            console.log(JSON.stringify(user));
    
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'type': 'text' },
                body: JSON.stringify(user),
            });
    
            if (response.ok) {
                const output = await response.json();
                dispatch(setUuid(output.uuid));
            
                const textGetResponse = await fetch('/api/generate', {
                    method: 'GET',
                    headers:  { 'Content-Type': 'application/json', 'type': 'text', 'uuid': output.uuid}
                });
    
                if (textGetResponse.ok) {
                    try {
                        const arrayBuffer = await textGetResponse.arrayBuffer();
                        const decoder = new TextDecoder('utf-8');
                        const story = decoder.decode(arrayBuffer).split(/(?<=([.!?]))\s+/).filter((e) => e.length > 1);
                        setStoryText(story);
                        setLoading(false);
                        setGotStory(true);
                    } catch (error) {
                        console.error('Error decoding text');
                    }
                }
            }
        } else {
            let id = localStorage.getItem('userId');

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'type': 'audio', 'uuid': user.requestUuid, 'userId': id as string, 'language': user.language, 'voiceGender': user.voiceGender},
                body: JSON.stringify(storyText.join(''))
            });

            if (response.ok) {
                if (id !== '') {
                    const uuid = `${id}/${user.requestUuid}`;
                    const audioGetResponse = await fetch('/api/generate', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json', 'type': 'audio', 'uuid': uuid },
                    });
        
                    if (audioGetResponse.ok) {
                        getAudio(audioGetResponse);
                    }
                } else {
                    getAudio(response);
                }
            }
        }
    }

    return (
        <div className='px-32 py-10 text-center text-2xl font-bold'>
            <Typography variant="h5" gutterBottom fontWeight='bold' paddingBottom={5}> 
                User Preferences
            </Typography>
            <ProgressStepper activeStep={activeStep} setActiveStep={setActiveStep}/>
            <Box id="outer"
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start',
                    height: 'auto',
                    minHeight: '80vh',
                    padding: 0,
                }}>
                <Box id="inner"
                      sx={{
                        width: '100%',
                        maxWidth: 1200,
                        height: 'auto',
                        flexDirection: 'column',
                        backgroundColor: 'var(--background-secondary)',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        overflowY: 'visible',
                    }}>
                    {activeStep === 0 &&
                        <Box>
                            {inputList}
                            <IconButton color="primary" aria-label="add" onClick={() => genButtonClick()} sx={{ fontSize: 20 }}>
                                <AddIcon />
                                New User
                            </IconButton>
                        </Box>
                    }
                    {activeStep === 1 &&
                        <Stack
                            spacing={4}
                            sx={{
                                width: '100%',
                                maxWidth: '1200px',
                                margin: '0 auto',
                                alignItems: 'center',
                            }}>
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                <FormControl
                                    variant="filled"
                                    sx={{
                                        minWidth: 240,
                                        backgroundColor: 'var(--background)',
                                    }}>
                                    <InputLabel id="content-type-label">Content Type</InputLabel>
                                    <Select
                                        labelId="content-type-label"
                                        id="content-type-select"
                                        defaultValue=""
                                        onChange={(e) => dispatch(setType(e.target.value))}>
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="story">Story</MenuItem>
                                        <MenuItem value="podcast">Podcast</MenuItem>
                                        <MenuItem value="interactive class">Interactive Class</MenuItem>
                                    </Select>
                                </FormControl>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography>Generate keywords</Typography>
                                    <Checkbox onChange={(e) => dispatch(setKeywords(e.target.checked))} />
                                </Stack>
                            </Stack>
                            <Box sx={{ textAlign: 'center', width: '100%' }}>
                                <Typography gutterBottom>Duration (minutes)</Typography>
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    {minChoices.map((num) => (
                                        <Button
                                            key={num}
                                            color="success"
                                            disabled={loading}
                                            onClick={() => handleMinsChange(num)}
                                            style={{backgroundColor: minsStates.get(num) ? 'var(--button)' : 'var(--logo-shadow)'}}
                                            >
                                            {num}
                                        </Button>
                                    ))}
                                    <TextField
                                        type="number"
                                        placeholder="Custom"
                                        inputProps={{ min: 1, max: 15 }}
                                        onChange={(e) => handleMinsChange(Number(e.target.value))}
                                        sx={{ width: 110 }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ textAlign: 'center', width: '100%' }}>
                                <Typography gutterBottom>Age Range (min-max)</Typography>
                                <Slider
                                    value={ageRange}
                                    onChange={handleAgeSliderChange}
                                    valueLabelDisplay="auto"
                                    min={1}
                                    max={18}
                                    sx={{ maxWidth: 300, margin: '0 auto' }}/>
                                <Stack direction="row" justifyContent="space-between" sx={{ maxWidth: 300, margin: '0 auto' }}>
                                    <Typography>Min: {ageRange[0]}</Typography>
                                    <Typography>Max: {ageRange[1]}</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    }
                    {activeStep === 2 &&
                        <Box>
                            <Typography variant='h5'>Plot Archetypes</Typography>
                            <Typography fontSize={15} paddingBottom={2}> Choose at most 5 themes for your generated content to follow </Typography>
                                <CheckboxGrid 
                                    numCols={4} 
                                    entries={
                                    ['Hero\'s journey', 'Coming of Age', 'Rags to riches', 'Underdog', 'Quest', 'Sacrifice', 'Mystery', 
                                    'Chosen one', 'Fish out of water', 'Parallel worlds', 'Dystopia', 'Survival', 'Discovery', 'Identity Crisis',
                                    'Time travel', 'Apocalypse', 'Power and corruption', 'Tragedy', 'Forbidden knowledge', 'Society versus individual', 
                                    'Body swap', 'Prophecy', 'Wandering hero', 'Time loop', 'Love at first sight', 'Human versus nature',
                                    'Heir to the throne', 'Cursed object', 'Immortality quest', 'Forbidden power', 'Race against time',
                                    'Forbidden journey', 'Crime and punishment', 'Parallel lives', 'Generation gaps', 'Lost civilization'
                                ]}/>
                        </Box>
                    }
                    {activeStep === 3 &&
                        <Box>
                            {entriesVisible && 
                                <Grid container spacing={2}>
                                <Grid size={6}>
                                    <TextField sx={{ width:'640px', backgroundColor: 'var(--background)' }}
                                        id="filled-basic" 
                                        label="Other information" 
                                        variant="filled" 
                                        multiline
                                        minRows={2}
                                        maxRows={3}
                                        onChange={e => dispatch(setOtherInfo(e.target.value))}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <FormControl variant="filled" sx={{ m: 1, minWidth: 250, backgroundColor: 'var(--background)' }}>
                                        <InputLabel id="demo-simple-select-filled-label">Language</InputLabel>
                                        <Select
                                        labelId="demo-simple-select-filled-label"
                                        id="demo-simple-select-filled"
                                        defaultValue={"English"}
                                        onChange={(e) =>  dispatch(setLanguage(e.target.value as string))}
                                        >
                                        <MenuItem value="Arabic">Arabic</MenuItem>
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="French">French</MenuItem>
                                        <MenuItem value="German">German</MenuItem>
                                        <MenuItem value="Japanese">Japanese</MenuItem>
                                        <MenuItem value="Mandarin">Mandarin</MenuItem>
                                        <MenuItem value="Spanish">Spanish</MenuItem>
                                        <MenuItem value="Russian">Russian</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl variant="filled" sx={{ m: 1, minWidth: 100, backgroundColor: 'var(--background)' }}>
                                        <InputLabel id="demo-simple-select-filled-label">Voice gender</InputLabel>
                                        <Select
                                        labelId="demo-simple-select-filled-label"
                                        id="demo-simple-select-filled"
                                        defaultValue={"Female"}
                                        onChange={(e) => dispatch(setVoiceGender(e.target.value as string))}
                                        >
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            }
                        <br/>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                            <Button 
                                style={{ backgroundColor: loading ? '#D3D3D3' : '#4CAF50', color: '#FFF' }} 
                                rounded 
                                size='large' 
                                onClick={() => handleUpdate(gotStory ? true : false)}> 
                                    {gotStory ? 'Generate audio' : 'Generate text'}
                            </Button>
                            <Box sx={{ width: 48, height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {loading && <CircularProgress size={40} />}
                            </Box>
                        </Box>
                        <br/>
                        <br/>
                        <Box sx={{width: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>  
                            {isAudio && 
                                <Stack direction='row' spacing={2} width='600px'>
                                    <AudioPlayer autoPlay src={getBlobUrl(audioBuffer as AudioBuffer)} onPlay={() => console.log('Playing')}/>
                                    <DownloadIcon fontSize='large' sx={{ cursor: 'pointer' }} onClick={() => downloadStory(getBlobUrl(audioBuffer as AudioBuffer), storyText)}/>
                                </Stack>
                            }
                        </Box>
                        <br/>
                        {storyText.length !== 0 && storyText.map((sentence, index) => {
                            return (
                            <Box key={index}>
                                <Typography variant="body1" gutterBottom fontSize={22}> {sentence} </Typography>
                            </Box>
                            );
                        })}
                        </Box>
                    }
                </Box>  
            </Box>
        </div>
    );
}