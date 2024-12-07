import { Box, IconButton, Stack, Typography } from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { getBlobUrl } from "@/lib/utils";
import Button from "./Button";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState, useMemo } from "react";
import { downloadStory } from "@/lib/utils";

interface ContentPlayerProps {
    contentName: string,
    audio: AudioBuffer,
    index: number,
    storyId: string,
    onDelete: (index: number) => void,
}

//content name, duration, launch play button (if pressed, launch audio player, when pressed again, close audio player), share button
export const ContentPlayer = ({contentName, audio, index, storyId, onDelete}: ContentPlayerProps) => {
    const [launchPlayer, setLaunchPlayer] = useState(false);
    const [story, setStory] = useState(['']);
    const [showTranscript, setShowTranscript] = useState(false);

    const duration = audio.length / audio.sampleRate; // seconds
    const minutes = Math.floor(duration / 60);
    const seconds = (duration - minutes * 60).toString().slice(0, 2);
    const audioSrc = useMemo(() => getBlobUrl(audio as AudioBuffer), [audio]);

    const deleteStory = () => {
        onDelete(index);
    }

    const fetchTranscript = async () => {
        setShowTranscript(!showTranscript);
        if (story.length === 1) {
            const textGetResponse = await fetch('/api/generate', {
                method: 'GET',
                headers:  { 'Content-Type': 'application/json', 'uuid': storyId, 'type': 'text'} // eventually, store in individual collection with key: `${localStorage.getItem('userId')}/${storyId}`
            });
    
            if (textGetResponse.ok) {
                try {
                    const arrayBuffer = await textGetResponse.arrayBuffer();
                    const decoder = new TextDecoder('utf-8');
                    const story = decoder.decode(arrayBuffer).split(/(?<=([.!?]))\s+/).filter((e) => e.length > 1);
                    setStory(story);
                } catch (error) {
                    console.error('Error decoding text');
                }
            }
        }
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
                        <Stack spacing={0.5} alignItems='center' width='150px'>
                            <Typography fontSize={20} sx={{ color: 'black' }}> {contentName} </Typography>
                            {launchPlayer &&
                                <Button rounded style={{ fontSize: '10pt' }} onClick={() => fetchTranscript()}> 
                                    {showTranscript ? 'Hide transcript' : 'Show transcript'}
                                </Button>
                            }
                        </Stack>
                        {!launchPlayer &&
                            <Typography fontSize={20} sx={{ color: 'black' }}> 
                                {`${minutes}:${seconds.includes('.') ? `0${seconds[0]}` : seconds}`} 
                            </Typography>
                        }
                    </Stack>
                    {launchPlayer &&
                        <Box width='400px'>
                            <AudioPlayer autoPlay src={audioSrc} style={{ backgroundColor: 'var(--selected)' }}/>
                        </Box>
                    }
                    <Stack direction='row' spacing={2} paddingLeft={launchPlayer ? '70px' : '220px'} alignItems='center' justifyContent='center'>
                        <Button onClick={() => setLaunchPlayer(!launchPlayer)} style={{ backgroundColor: 'var(--selected)' }}>
                            <LaunchIcon/>
                            {launchPlayer ? 'Collapse' : 'Launch'}
                        </Button>
                        <ShareIcon fontSize='large' sx={{ cursor: 'pointer' }} />
                        <DownloadIcon fontSize='large' sx={{ cursor: 'pointer' }} onClick={() => downloadStory(audioSrc, story)}/>
                        <IconButton 
                            color="primary" 
                            aria-label="delete" 
                            onClick={() => deleteStory()}>
                            <DeleteForeverIcon fontSize='large' sx={{color: 'darkred'}}/>
                        </IconButton>
                    </Stack>
                </Stack>
                {(showTranscript && story.length !== 0) && story.map((sentence, index) => {
                        return (
                        <div key={index}>
                            <Typography variant="body1" gutterBottom fontSize={22}> {sentence} </Typography>
                        </div>
                        );
                    })}
            </Stack>
        </Box>
    );
}