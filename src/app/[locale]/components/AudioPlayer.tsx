import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

interface AudioPlayerProps {
    audioBuffer: AudioBuffer | null;
}

const AudioPlayer = ({ audioBuffer }: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioContext] = useState(() => new window.AudioContext());
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null); 

    useEffect(() => {
        if (audioBuffer && audioContext) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            audioSourceRef.current = source;
        }
    }, [audioBuffer, audioContext]);

    const handlePlayPause = () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (isPlaying) {
            audioSourceRef.current?.stop();
        } else {
            if (audioSourceRef.current) {
                const newSource = audioContext.createBufferSource();
                newSource.buffer = audioBuffer;
                newSource.connect(audioContext.destination);
                newSource.start(); 
                audioSourceRef.current = newSource; 
            }
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div>
            <Button rounded size='large' onClick={handlePlayPause}>
                {isPlaying ? 'Restart' : 'Play'}
            </Button>
        </div>
    );
};

export default AudioPlayer;
