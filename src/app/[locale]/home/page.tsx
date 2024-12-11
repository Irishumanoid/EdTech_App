'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setType, setNumMins, setAgeRange as setAges, setOtherInfo, setKeywords, 
         setLanguage, updateUsers, setVoiceGender, setUuid, resetPlots } from '../../store/features/userStorySlice';
import { ChildInfo } from '../components/ChildInfo';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { getBlobUrl, downloadStory } from '@/lib/utils';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export default function Home() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    
    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const [inputList, setInputList] = useState([<ChildInfo index={0} key={0} onDelete={() => handleUserDelete(0)}/>]);
    const [minutes, setMinutes] = useState(1);
    const [ageRange, setAgeRange] = useState([1, 18]);
    
    // Story generation state
    const [isAudio, setIsAudio] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [storyText, setStoryText] = useState(['']);
    const [gotStory, setGotStory] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset state on mount
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

    // Step navigation
    const totalSteps = 4;
    
    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // User management
    const handleAddUser = () => {
        const newIndex = inputList.length;
        setInputList(prevList => [
            ...prevList,
            <ChildInfo key={newIndex} index={newIndex} onDelete={() => handleUserDelete(newIndex)} />
        ]);
    };

    const handleUserDelete = (index: number) => {
        setInputList(prevList => {
            const updatedList = prevList.filter((_, i) => i !== index);
            return updatedList.map((child, i) =>
                React.cloneElement(child, { index: i, key: i, onDelete: () => handleUserDelete(i) })
            );
        });
    };

    // Form handlers
    const handleMinsChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setMinutes(newValue);
            dispatch(setNumMins(newValue));
        }
    };

    const handleAgeChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setAgeRange(newValue as [number, number]);
            dispatch(setAges(newValue));
        }
    };

    // Audio processing
    const handleAudioProcessing = async (response: Response) => {
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
    };

    // Story generation
    const handleGenerate = async (audioGen: boolean) => {
        setLoading(true);
        if (isAudio) setIsAudio(false);

        if (!audioGen) {
            await handleTextGeneration();
        } else {
            await handleAudioGeneration();
        }
    };

    const handleTextGeneration = async () => {
        setStoryText([]);
        const updatedUsers = user.users.filter(curUser => 
            !(curUser.name === "" && curUser.preferences.length === 0 && curUser.pronoun === "")
        );
        
        dispatch(updateUsers({users: updatedUsers}));

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'type': 'text' },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            const output = await response.json();
            dispatch(setUuid(output.uuid));
            await fetchGeneratedText(output.uuid);
        }
    };

    const fetchGeneratedText = async (uuid: string) => {
        const textResponse = await fetch('/api/generate', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'type': 'text', 'uuid': uuid }
        });

        if (textResponse.ok) {
            try {
                const arrayBuffer = await textResponse.arrayBuffer();
                const decoder = new TextDecoder('utf-8');
                const story = decoder.decode(arrayBuffer).split(/(?<=([.!?]))\s+/).filter((e) => e.length > 1);
                setStoryText(story);
                setLoading(false);
                setGotStory(true);
            } catch (error) {
                console.error('Error decoding text');
            }
        }
    };

    const handleAudioGeneration = async () => {
        const userId = localStorage.getItem('userId');
        
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'type': 'audio', 
                'uuid': user.requestUuid, 
                'userId': userId as string,
                'language': user.language,
                'voiceGender': user.voiceGender
            },
            body: JSON.stringify(storyText.join(''))
        });

        if (response.ok) {
            if (userId) {
                const uuid = `${userId}/${user.requestUuid}`;
                const audioResponse = await fetch('/api/generate', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'type': 'audio', 'uuid': uuid },
                });

                if (audioResponse.ok) {
                    handleAudioProcessing(audioResponse);
                }
            } else {
                handleAudioProcessing(response);
            }
        }
    };

    // Step content rendering
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Character Information</h2>
                        {inputList}
                        <button 
                            onClick={handleAddUser}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white"
                            aria-label="Add new user"
                        >
                            <span>Add User</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Age and Duration</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Duration (minutes)</label>
                                <input 
                                    type="range"
                                    min={1}
                                    max={20}
                                    value={minutes}
                                    onChange={(e) => handleMinsChange(e as unknown as Event, parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <span className="mt-1 block text-sm">{minutes} minutes</span>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Age Range</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="range"
                                        min={1}
                                        max={18}
                                        value={ageRange[0]}
                                        onChange={(e) => handleAgeChange(e as unknown as Event, [parseInt(e.target.value), ageRange[1]])}
                                        className="w-full"
                                    />
                                    <input 
                                        type="range"
                                        min={1}
                                        max={18}
                                        value={ageRange[1]}
                                        onChange={(e) => handleAgeChange(e as unknown as Event, [ageRange[0], parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                </div>
                                <div className="mt-1 flex justify-between text-sm">
                                    <span>Min: {ageRange[0]}</span>
                                    <span>Max: {ageRange[1]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Content Preferences</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Content Type</label>
                                <select 
                                    onChange={(e) => dispatch(setType(e.target.value))}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                >
                                    <option value="">Select type</option>
                                    <option value="story">Story</option>
                                    <option value="podcast">Podcast</option>
                                    <option value="interactive class">Interactive Class</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox"
                                    onChange={(e) => dispatch(setKeywords(e.target.checked))}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label className="text-sm">Generate keywords</label>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Additional Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Language</label>
                                <select 
                                    onChange={(e) => dispatch(setLanguage(e.target.value))}
                                    defaultValue="English"
                                    className="w-full rounded-md border border-gray-300 p-2"
                                >
                                    {['Arabic', 'English', 'French', 'German', 'Japanese', 'Mandarin', 'Spanish', 'Russian'].map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Voice Gender</label>
                                <select 
                                    onChange={(e) => dispatch(setVoiceGender(e.target.value))}
                                    defaultValue="Female"
                                    className="w-full rounded-md border border-gray-300 p-2"
                                >
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Additional Information</label>
                                <textarea 
                                    onChange={e => dispatch(setOtherInfo(e.target.value))}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Progress indicator */}
            <div className="mb-8 flex justify-between">
                {[1, 2, 3, 4].map((step) => (
                    <div 
                        key={step}
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            step === currentStep 
                                ? 'bg-primary text-white' 
                                : step < currentStep 
                                ? 'bg-green-200' 
                                : 'bg-gray-200'
                        }`}
                    >
                        {step}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="rounded-lg bg-white p-6 shadow-md">
                {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 disabled:opacity-50"
                >
                    Back
                </button>
                {currentStep === totalSteps ? (
                    <button
                        onClick={() => handleGenerate(false)}
                        disabled={loading}
                        className="rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Story'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="rounded-md bg-primary px-4 py-2 text-white"
                    >
                        Next
                    </button>
                )}
            </div>

            {/* Results section */}
            <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="mt-4 text-lg text-gray-600">Generating your story...</p>
                    </div>
                ) : (
                    <>
                        {isAudio && (
                            <div className="mb-6 flex items-center gap-4">
                                <AudioPlayer 
                                    autoPlay 
                                    src={getBlobUrl(audioBuffer as AudioBuffer)} 
                                    onPlay={() => console.log('Playing')}
                                />
                                <button
                                    onClick={() => downloadStory(getBlobUrl(audioBuffer as AudioBuffer), storyText)}
                                    className="rounded-md bg-primary p-2 text-white"
                                    aria-label="Download story"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {storyText.length > 0 && (
                            <div className="space-y-4">
                                {storyText.map((sentence, index) => (
                                    <p key={index} className="text-lg leading-relaxed text-gray-700">
                                        {sentence}
                                    </p>
                                ))}
                                {gotStory && !isAudio && (
                                    <button
                                        onClick={() => handleGenerate(true)}
                                        className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
                                    >
                                        Generate Audio
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}