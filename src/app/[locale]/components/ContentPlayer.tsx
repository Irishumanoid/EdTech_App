import { Box, IconButton, Stack, Typography } from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { getBlobUrl } from "@/lib/utils";
import Button from "./Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from "react";


interface ContentPlayerProps {
    contentName: string,
    audio: AudioBuffer,
}

//content name, duration, launch play button (if pressed, launch audio player, when pressed again, close audio player), share button
export const ContentPlayer = ({contentName, audio}: ContentPlayerProps) => {
    const [launchPlayer, setLaunchPlayer] = useState(false);

    const duration = audio.length / audio.sampleRate; // seconds
    const minutes = Math.floor(duration / 60);
    const seconds = (duration - minutes * 60).toString().slice(0, 2);

    const deleteStory = async () => {
        //delete story from gcloud, create onDelete prop
    }
 
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'var(--button)',
            width: '1000px',
            height: 'auto',
            flexDirection: 'column',
            overFlowY: 'visible',
            padding: '2rem',
            borderRadius: '8px',
            borderTop: '2px solid var(--background-secondary)',
            borderBottom: '2px solid var(--background-secondary)'
        }}>
            <Stack spacing={4} alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={4} paddingRight={launchPlayer ? '70px' : '220px'} alignItems='center'>
                        <Typography fontSize={20} sx={{ color: 'black' }}> {contentName} </Typography>
                        {!launchPlayer &&
                            <Typography fontSize={20} sx={{ color: 'black' }}> {`${minutes}:${seconds.includes('.') ? `0${seconds[0]}` : seconds}`} </Typography>
                        }
                    </Stack>
                    {launchPlayer &&
                        <Box width='400px'>
                            <AudioPlayer autoPlay src={getBlobUrl(audio as AudioBuffer)} style={{ backgroundColor: 'var(--selected)' }}/>
                        </Box>
                    }
                    <Stack direction='row' spacing={4} paddingLeft={launchPlayer ? '70px' : '220px'} alignItems='center'>
                        <Button onClick={() => setLaunchPlayer(!launchPlayer)} style={{ backgroundColor: 'var(--selected)' }}>
                            <LaunchIcon/>
                            {launchPlayer ? 'Collapse' : 'Launch'}
                        </Button>
                        <ShareIcon sx={{ color: 'black' }}/>
                        <IconButton 
                            color="primary" 
                            aria-label="delete" 
                            onClick={() => deleteStory()}>
                            <DeleteForeverIcon sx={{color: 'darkred', fontSize: 30}}/>
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}