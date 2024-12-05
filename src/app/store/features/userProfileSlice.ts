import Image from 'next/image';

interface userProfileState {
    username: string,
    bio: string,
}

const initialState: userProfileState = {
    username: '',
    bio: '',
}