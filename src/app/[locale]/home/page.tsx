'use client'
import * as React from 'react';
import Box from '@mui/material/Box';

import { useAppDispatch, useAppSelector } from  '../../store/hooks';
import { setType, setNumMins, setAgeRange as setAges, setOtherInfo, setKeywords, setLanguage, updateUsers, setVoiceGender, setUuid, resetPlots } from '../../store/features/userStorySlice';
import Button from '../components/Button';
import { ChildInfo } from '../components/ChildInfo';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Slider, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { getBlobUrl } from '@/lib/utils';


//on submit, add everything to gptprompt object
export default function Home() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const [inputList, setInputList] = useState([<ChildInfo index={0} key={0} onDelete={() => userDelete(0)}/>]);
    const [minutes, setMinutes] = useState(1);
    const [ageRange, setAgeRange] = useState([0, 18]);
    const [isAudio, setIsAudio] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [storyText, setStoryText] = useState(['']);
    const [loading, setLoading] = useState(false);

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
    }, []);

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

    const handleMinsSliderChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setMinutes(newValue);
            dispatch(setNumMins(newValue));
        }
    };

    const handleAgeSliderChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setAgeRange(newValue as [number, number]);
            dispatch(setAges(newValue));
        }
    };

    //fetch everything from user object and generate story
    const handleUpdate = async () => {
        setLoading(true);
        setStoryText([]);
        if (isAudio) {
            setIsAudio(false);
        }
        const updatedUsers = user.users.filter((curUser) => 
            !(curUser.name === "" && curUser.preferences.length === 0 && curUser.pronoun === "")
        );
        
        dispatch(updateUsers({users: updatedUsers}));  
        console.log(JSON.stringify(user));

        const id = localStorage.getItem('userId');
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'userId': id ? id : '' },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            const output = await response.json();
            dispatch(setUuid(output.uuid));
            const audioGetResponse = await fetch('/api/generate', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'uuid': output.uuid, 'type': 'audio'}
            });
            const textGetResponse = await fetch('/api/generate', {
                method: 'GET',
                headers:  { 'Content-Type': 'application/json', 'uuid': output.uuid, 'type': 'text'}
            });

            if (audioGetResponse.ok) {
                try {
                    const audioContext = new window.AudioContext();
                    const arrayBuffer = await audioGetResponse.arrayBuffer();
                    audioContext.decodeAudioData(arrayBuffer, (decodedData) => {
                        setAudioBuffer(decodedData);
                        setIsAudio(true);
                        setLoading(false);
                    });
                } catch (error) {
                    console.error('Error decoding audio');
                }
            }

            if (textGetResponse.ok) {
                try {
                    const arrayBuffer = await textGetResponse.arrayBuffer();
                    const decoder = new TextDecoder('utf-8');
                    const story = decoder.decode(arrayBuffer).split(/(?<=([.!?]))\s+/).filter((e) => e.length > 1);
                    setStoryText(story);
                } catch (error) {
                    console.error('Error decoding text');
                }
            }
        }
    }

    return (
        <div className='px-32 py-10 text-center text-2xl font-bold'>
            <label>User preferences</label>
            <br/><br/>
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
                        width: 1200,
                        height: 'auto',
                        flexDirection: 'column',
                        backgroundColor: 'var(--background-secondary)',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        overflowY: 'visible',
                    }}>
                    {inputList}
                    <IconButton color="primary" aria-label="add" onClick={() => genButtonClick()} sx={{ fontSize: 20 }}>
                        <AddIcon />
                        New User
                    </IconButton>
                    <Box sx={{ flexGrow: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={3}>
                                <FormControl variant="filled" sx={{ m: 1, minWidth: 150, backgroundColor: 'var(--background)' }}>
                                    <InputLabel id="demo-simple-select-filled-label" >Content Type</InputLabel>
                                    <Select
                                    labelId="demo-simple-select-filled-label"
                                    id="demo-simple-select-filled"
                                    defaultValue={""}
                                    onChange={(e) => dispatch(setType(e.target.value as string))}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="story">Story</MenuItem>
                                        <MenuItem value="podcast">Podcast</MenuItem>
                                        <MenuItem value="interactive class">Interactive Class</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={3}>
                                <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography gutterBottom>Duration (minutes)</Typography>
                                    <Slider 
                                    value={minutes}
                                    onChange={handleMinsSliderChange}
                                    valueLabelDisplay="auto" 
                                    min={1} 
                                    max={20} 
                                    />
                                </Box>
                            </Grid>
                            <Grid size={3}>
                                <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography gutterBottom>Age range (min-max)</Typography>
                                    <Slider
                                    value={ageRange}
                                    onChange={handleAgeSliderChange}
                                    valueLabelDisplay="auto"
                                    min={1}
                                    max={18}
                                    />
                                    <Typography>Min: {ageRange[0]}</Typography>
                                    <Typography>Max: {ageRange[1]}</Typography>
                                </Box>
                            </Grid>
                            <Grid size={3}>
                                <Typography gutterBottom> Generate keywords </Typography>
                                <Checkbox onChange={(e) => dispatch(setKeywords(e.target.checked))}/>
                            </Grid>
                        </Grid>
                    </Box>
                    <Typography variant='h6'>Story Archetype</Typography>
                    <Accordion sx={{backgroundColor: 'var(--background)'}}>
                        <AccordionSummary
                        expandIcon={<ArrowDownwardIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        </AccordionSummary>
                        <AccordionDetails>
                        <CheckboxGrid 
                            numCols={4} 
                            entries={
                            ['Hero\'s journey', 'Coming of Age', 'Rags to riches', 'Underdog', 'Quest', 'Sacrifice', 'Mystery', 
                            'Chosen one', 'Fish out of water', 'Parallel worlds', 'Dystopia', 'Survival', 'Discovery', 'Identity Crisis',
                            'Family drama', 'Time travel', 'Apocalypse', 'Power and corruption', 'Tragedy', 'Reincarnation', 'Framing device',
                            'Stranger in strange land', 'Escape from death', 'Forbidden knowledge', 'Society versus individual', 
                            'Body swap', 'Prophecy', 'Seeking home', 'Wandering hero', 'Time loop', 'Love at first sight', 'Human versus nature',
                            'Heir to the throne', 'Corrupting influence', 'Cursed object', 'Mistaken identity', 'Immortality quest',
                            'Sworn enemies', 'Man versus machine', 'Forbidden power', 'Madness and sanity', 'Race against time',
                            'Forbidden journey', 'Crime and punishment', 'Parallel lives', 'Generation gaps', 'Navigating the afterlife',
                            'Puppet master', 'Enchanted forest', 'Lost civilization'
                            ]}/>
                        </AccordionDetails>
                    </Accordion>
                    <br/>
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
                                onChange={(e) => dispatch(setLanguage(e.target.value as string))}
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
                    <br/>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        <Button 
                            style={{ backgroundColor: loading ? '#D3D3D3' : '#4CAF50', color: '#FFF' }} 
                            rounded 
                            size='large' 
                            onClick={handleUpdate}> 
                                Generate 
                        </Button>
                        <Box sx={{ width: 48, height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loading && <CircularProgress size={40} />}
                        </Box>
                    </Box>
                    <br/>
                    <br/>
                    <Box sx={{width: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>  
                        {isAudio && <AudioPlayer autoPlay src={getBlobUrl(audioBuffer as AudioBuffer)} onPlay={() => console.log('Playing')}/>}
                    </Box>
                    <br/>
                    {storyText.length !== 0 && storyText.map((sentence, index) => {
                        return (
                        <div key={index}>
                            <Typography variant="body1" gutterBottom fontSize={22}> {sentence} </Typography>
                        </div>
                        );
                    })}
                </Box>  
            </Box>
        </div>
    );
}