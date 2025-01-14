'use client'

import { AppBar, Box, Button, CircularProgress, Dialog, IconButton, Slide, Stack, Toolbar, Typography } from "@mui/material";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import SettingsIcon from '@mui/icons-material/Settings';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { forwardRef, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { ContentPlayer } from "../components/ContentPlayer";
import { TransitionProps } from "@mui/material/transitions";
import Home from "../home/page";
import { ProfileUpdater } from "../components/ProfileUpdater";
import { randomNumber } from "@/lib/utils";

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
    const [profileEdit, setProfileEdit] = useState(false);
    const [ids, setIds] = useState(['']);
    const [nameMap, setNameMap] = useState(new Map<string, string>()); // maps ids to name
    const [content, setContent] = useState<AudioBuffer[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState(''); 
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [curPlaying, setCurPlaying] = useState(-1);
    const [shuffle, setShuffle] = useState(false);

    useEffect(() => {
        const audioContext = new window.AudioContext();

        const fetchStories = async () => {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }

            const userProfileResponse = await fetch('/api/profile', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'userId': userId }
            });

            if (userProfileResponse.ok) {
                const profilePic = await userProfileResponse.arrayBuffer();
                if (profilePic) {
                    const contentType = userProfileResponse.headers.get('Content-Type');
                    if (contentType) {
                        const blob = new Blob([profilePic], {type: contentType as string});
                        const url = URL.createObjectURL(blob);
                        setImage(url);
                    } else {
                        console.error('No content type for image specified');
                    }
                }

                const bio = userProfileResponse.headers.get('bio');
                const username = userProfileResponse.headers.get('username');
                if (bio && bio !== '') {
                    console.log(`bio is ${bio}`);
                    setBio(bio);
                }
                if (username && username !== '') {
                    setUsername(username);
                }
            }
            
            const idsGetResponse = await fetch('/api/login', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'userId': userId }
            });
    
            if (idsGetResponse.ok) {
                const response = await idsGetResponse.json();
                const ids: string[] = response.storyIds;
                setIds(ids);

                const idsToNames: Map<string, string> = new Map(await Promise.all(
                    ids.map(async (id): Promise<[string, string]> => {
                        const nameResponse = await fetch('/api/generate', {
                            method: 'GET',
                            headers: { 
                                'Content-Type': 'application/json', 
                                'uuid': id, 
                                'type': 'storyName' 
                            }
                        });

                        if (nameResponse.ok) {
                            const response = await nameResponse.json();
                            return [id, response.name];
                        } else {
                            throw new Error(`Failed to fetch story name for id ${id}`);
                        }
                    })
                ));
                setNameMap(idsToNames);
    
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

    useEffect(() => {
        if (shuffle) {
            playNext();
        }
    }, [shuffle]);

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
        const id = ids[index];
        const newMap = nameMap;
        newMap.delete(id);
        setNameMap(newMap);

        try {
            const deleteResponse = await fetch('/api/generate', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'uuid': `${localStorage.getItem('userId')}/${id}` }
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

    //set state of launch player of given index to true (create new prop)
    const playNext = () => {
        if (content) {
            const next = randomNumber(content.length);
            setCurPlaying(next);
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
                    <Image 
                        src={image !== null && image !== '' && image !== undefined ? image : '/placeholder_person.jpg'} 
                        alt='profile picture' 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'cover' }}
                        onClick={() => setProfileEdit(true)}/>
                    <Stack spacing={6}>
                        <Typography variant='h4' onClick={() => setProfileEdit(true)} sx={{ position: 'absolute', left: '180px', top: '15px', cursor: 'pointer' }}> 
                            {username !== '' ? username : 'Placeholder Username'}
                        </Typography>
                        <Typography fontSize={16} onClick={() => setProfileEdit(true)} sx={{ position: 'absolute', left: '180px', top: '15px', cursor: 'pointer', maxWidth: '600px' }}> 
                            {bio !== '' ? bio : 'Write a quick bio here!'}
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
                            width: '250px',
                            height: '100%',
                            minHeight: '80vh',
                            padding: '2rem',
                            borderRadius: '8px',
                            borderRight: '1px solid #ccc',
                            borderColor: 'var(--secondary)',
                        }}>
                            <Stack spacing={1}>
                                <Button key='view-playlist' sx={{color: 'var(--primary)', fontSize: 16}}> View playlists </Button>
                                <Button key='feedback' sx={{color: 'var(--primary)', fontSize: 16}}> Give us feedback </Button>
                            </Stack>
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
                            borderLeft: '2px solid #ccc',
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
                                    <Stack direction='row' spacing={65} alignItems='center'>
                                        <Stack spacing={1}>
                                            <Typography fontSize={30} sx={{color: 'black'}}>Story Maker</Typography>
                                            <Typography fontSize={18} sx={{color: 'black'}}>Generate another masterpiece</Typography>
                                        </Stack>
                                        <Button size='small' sx={{backgroundColor: 'var(--selected)', height: '50px'}} onClick={() => handleClickOpen()}>Generate new</Button>
                                    </Stack>
                                </Box>
                                <Stack direction='row' paddingTop='40px' paddingBottom='25px' alignItems='center' spacing={1}>
                                    <Typography variant='h4' paddingRight='15px' sx={{ textAlign: 'left'}}> 
                                        Your Stories 
                                    </Typography>
                                    <ShuffleIcon sx={{fontSize: '30pt'}} onClick={() => setShuffle(true)}/>
                                    <SkipNextIcon sx={{fontSize: '30pt'}} onClick={() => playNext()}/>
                                </Stack>
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
                                        const name = nameMap.get(ids[index]);
                                        return(
                                            <Box key={index}>
                                                <ContentPlayer 
                                                    key={index} 
                                                    contentName={`Story ${name ? name : index+1}`} 
                                                    index={index} 
                                                    storyId={ids[index]}
                                                    playNow={curPlaying === index ? true : false} 
                                                    onDelete={() => contentDelete(index)} 
                                                    onEnd={() => shuffle && playNext()}
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
                <ProfileUpdater open={profileEdit} onClose={() => setProfileEdit(false)}/>
                <Dialog
                    fullScreen
                    open={popupOpen}
                    onClose={() => handleClose(false)}
                    TransitionComponent={Transition}
                    sx={{backgroundColor: 'transparent' }}
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
