'use client'

import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import SettingsIcon from '@mui/icons-material/Settings';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from "react";
import { ContentPlayer } from "../components/ContentPlayer";


export default function Dashboard() {
    const theme = createTheme({
        typography: {
          fontFamily: 'quicksand',
        },
    });

    const [content, setContent] = useState<AudioBuffer[] | null>(null);
    
    useEffect(() => {
        const fetchStories = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }
            const idsGetResponse = await fetch('/api/login', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'userId': userId }
            });
    
            if (idsGetResponse.ok) {
                const response = await idsGetResponse.json();
                const ids: string[] = response.storyIds;
    
                try {
                    const decodedDataArray: AudioBuffer[] = await Promise.all(
                        ids.map(async (id): Promise<AudioBuffer> => {
                            const audioGetResponse = await fetch('/api/generate', {
                                method: 'GET',
                                headers: { 
                                    'Content-Type': 'application/json', 
                                    'uuid': `${userId}/${id}`, 
                                    'type': 'audio' 
                                }
                            });
            
                            if (audioGetResponse.ok) {
                                const audioContext = new window.AudioContext();
                                const arrayBuffer = await audioGetResponse.arrayBuffer();
                                return new Promise<AudioBuffer>((resolve, reject) => {
                                    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
                                });
                            } else {
                                throw new Error(`Failed to fetch audio for id: ${id}`);
                            }
                        })
                    );
                    setContent(decodedDataArray);
                } catch (error) {
                    console.error('Error during audio processing:', error);
                }
            }
        }
        fetchStories();
    }, []);
      
    return (
        <ThemeProvider theme={theme}>
            <Box 
                sx={{
                    padding: '2rem', 
                    backgroundColor: 'var(--background-primary)', 
                    minHeight: '100vh', 
                }}
            >
                <Box id="profile"
                    sx={{
                        width: 'auto',
                        height: '150px',
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'left', 
                        flexDirection: 'column',
                        backgroundColor: 'var(--background-secondary)',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        overflowY: 'visible',
                        position: 'relative',
                        marginBottom: '2rem', 
                    }}
                >
                    <Image src={'/placeholder_person.jpg'} alt='profile picture' width={100} height={100} />
                    <Stack spacing={6}>
                        <Typography variant='h4' sx={{ position: 'absolute', left: '180px', top: '15px', cursor: 'pointer' }}> Placeholder Username </Typography>
                        <Typography fontSize={16} sx={{ position: 'absolute', left: '180px', top: '15px', cursor: 'pointer', maxWidth: '600px' }}> 
                            Write a quick bio here!
                        </Typography>
                    </Stack>
                    <SettingsIcon sx={{ position: 'absolute', right: '15px', top: '15px', cursor: 'pointer', fontSize: '50px' }}/>
                </Box>
                <Grid container sx={{display: 'flex'}}>
                    <Grid size={2}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-start', 
                            alignItems: 'flex-start',
                            backgroundColor: 'var(--background-secondary)',
                            height: '100%',
                            minHeight: '80vh',
                            padding: '2rem',
                            borderRadius: '8px',
                            borderRight: '1px solid #ccc',
                            borderColor: 'var(--secondary)',
                        }}>
                            <ButtonGroup
                                orientation="vertical"
                                aria-label="Vertical button group"
                                variant="text"
                                size="large"
                                sx={{width: '1000px'}}
                            >
                                <Button key='new-playlist'> Make new playlist </Button>
                                <Button key='view-playlist'> View playlists </Button>
                                <Button key='feedback'> Give us feedback </Button>
                            </ButtonGroup>
                        </Box>
                    </Grid>
                    <Grid size={10}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center', 
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        backgroundColor: 'var(--background-secondary)',
                        height: 'auto',
                        minHeight: '80vh',
                        padding: '2rem',
                        borderRadius: '8px',
                        flexDirection: 'column', 
                    }}>
                        <Stack spacing={0} sx={{ width: '100%' }}>
                            <Stack spacing={1} sx={{ alignContent: 'left', width: '1000px' }}>
                                <Typography variant='h4' sx={{ textAlign: 'left' }}> 
                                    Welcome back, your playlists are ready 
                                </Typography>
                                <Typography fontSize={16} sx={{ textAlign: 'left' }}> 
                                    Ready to immerse yourself in multilingual stories personalized to your preferences? 
                                </Typography>
                            </Stack>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center', 
                                alignItems: 'center',
                                backgroundColor: 'var(--button)',
                                width: '1000px',
                                height: '120px',
                                padding: '2rem',
                                borderRadius: '8px',
                                marginTop: '2rem', 
                            }}>
                                <Stack direction="row" spacing={65} alignItems='center'>
                                    <Stack spacing={1}>
                                        <Typography fontSize={30}>Story Maker</Typography>
                                        <Typography fontSize={18}>Generate another masterpiece</Typography>
                                    </Stack>
                                    <Button size='small' sx={{backgroundColor: 'var(--selected)', height: '50px'}}>Generate new</Button>
                                </Stack>
                            </Box>

                            <Typography variant='h4' sx={{ textAlign: 'left', marginTop: '2rem' }}> 
                                Your Stories 
                            </Typography>

                            {content === null && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    backgroundColor: 'var(--button)',
                                    width: '1000px',
                                    height: '150px',
                                    padding: '2rem',
                                    borderRadius: '8px',
                                    marginTop: '2rem',
                                }}>
                                    <Stack spacing={2}>
                                        <Typography fontSize={20} sx={{ textAlign: 'center', fontWeight: 900 }}>
                                            You don't have any stories yet.
                                        </Typography>
                                        <Typography fontSize={16} sx={{ textAlign: 'center' }}>
                                            Click the generate button above to create your first personalized story!
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}
                            {content !== null &&
                                content.map((c, index) => {
                                    return(
                                        <ContentPlayer key={index} contentName="test content" audio={c}/>
                                    );
                                })
                            }
                        </Stack>
                    </Box>
                    </Grid> 
                </Grid>
            </Box>
        </ThemeProvider>
    );
}
