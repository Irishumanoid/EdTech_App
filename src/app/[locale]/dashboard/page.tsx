'use client'

import { AppBar, Box, Button, ButtonGroup, CircularProgress, Dialog, IconButton, Slide, Stack, Toolbar, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import SettingsIcon from '@mui/icons-material/Settings';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { forwardRef, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { ContentPlayer } from "../components/ContentPlayer";
import { TransitionProps } from "@mui/material/transitions";
import Home from "../home/page";

const theme = createTheme({
    typography: {
      fontFamily: 'quicksand',
    },
});

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Dashboard() {
    const [popupOpen, setPopupOpen] = useState(false);
    const [ids, setIds] = useState(['']);
    const [content, setContent] = useState<AudioBuffer[] | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        localStorage.setItem('loggedIn', 'y');
        const audioContext = new window.AudioContext();

        const fetchStories = async () => {
            setLoading(true);
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
                setIds(ids);
    
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
                    setLoading(false);
                } catch (error) {
                    console.error('Error during audio processing:', error);
                }
            }
        }
        fetchStories();
    }, []);

    const handleClickOpen = () => {
        setPopupOpen(true);
    };
    
    const handleClose = (refresh: boolean) => {
        setPopupOpen(false);
        if (refresh) {
            window.location.reload();
        }
    };

    const contentDelete = async (index: number) => {
        if (content) {
            setContent(content.filter((_, i) => i !== index));
        }
        try {
            const deleteResponse = await fetch('/api/generate', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'uuid': `${localStorage.getItem('userId')}/${ids[index]}` }
            });
            if (deleteResponse.ok) {
                if (ids) {
                    setIds(ids.filter((_, i) => i !== index));
                }
            }
        } catch (error) {
            console.error(`failed to delete audio`, error);
        }
    }
 
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
                                        <Typography fontSize={30} sx={{color: 'black'}}>Story Maker</Typography>
                                        <Typography fontSize={18} sx={{color: 'black'}}>Generate another masterpiece</Typography>
                                    </Stack>
                                    <Button size='small' sx={{backgroundColor: 'var(--selected)', height: '50px'}} onClick={() => handleClickOpen()}>Generate new</Button>
                                </Stack>
                            </Box>
                            <Typography variant='h4' paddingBottom='25px' sx={{ textAlign: 'left', marginTop: '2rem' }}> 
                                Your Stories 
                            </Typography>
                            {(content?.length === 0 || loading) &&
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
                                    {loading? (
                                        <Stack spacing={2} alignItems="center" justifyContent="center">
                                            <Typography fontSize={20} sx={{ textAlign: 'center', fontWeight: 900, color: 'black' }}>
                                                Fetching your stories!
                                            </Typography>
                                            <CircularProgress size={40} />
                                        </Stack>
                                        ) : (
                                        <Stack spacing={2} alignItems="center" justifyContent="center">
                                            <Typography fontSize={20} sx={{ textAlign: 'center', fontWeight: 900, color: 'black' }}>
                                                You don&apos;t have any stories yet.
                                            </Typography>
                                            <Typography fontSize={16} sx={{ textAlign: 'center', color: 'black' }}>
                                                Click the generate button above to create your first personalized story!
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            }
                            {content !== null &&
                                content.map((c, index) => {
                                    return(
                                        <Box key={index}>
                                            <ContentPlayer 
                                                key={index} 
                                                contentName={`Story ${index+1}`} 
                                                index={index} 
                                                storyId={ids[index]} 
                                                onDelete={() => contentDelete(index)} 
                                                audio={c}
                                            />
                                        </Box>
                                    );
                                })
                            }
                        </Stack>
                    </Box>
                    </Grid> 
                </Grid>
                <Dialog
                    fullScreen
                    open={popupOpen}
                    onClose={() => handleClose(false)}
                    TransitionComponent={Transition}
                    sx={{backgroundColor: 'transparent'}}
                >
                    <AppBar sx={{ position: 'relative' }}>
                    <Toolbar sx={{ backgroundColor: 'darkgrey' }}>
                        <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => handleClose(false)}
                        aria-label="close"
                        >
                        <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Sound
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => handleClose(true)}>
                            Save
                        </Button>
                    </Toolbar>
                    <Home/>
                    </AppBar>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
