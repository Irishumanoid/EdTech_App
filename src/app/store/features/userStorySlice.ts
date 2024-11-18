import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChildType {
    name: string;
    pronoun: string;
    preferences: string[];
  };

interface userStoryState {
    users: ChildType[],
    type: string,
    numMins: number,
    ageRange: number[],
    plots: string[],
    keywords: boolean,
    otherInfo: string,
    language: string,
    requestUuid: string
}

const initialState: userStoryState = {
    users: [],
    type: '',
    numMins: 0,
    ageRange: [1, 100],
    plots: [],
    keywords: false,
    otherInfo: '',
    language: '',
    requestUuid: ''
}


const userStorySlice = createSlice({
    name: "userStory",
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<{ name: string, pronoun: string, preferences: string[] }>) => {
            state.users.push({
                name: action.payload.name,
                pronoun: action.payload.pronoun,
                preferences: action.payload.preferences,
            });
        },
        modifyUser: (state, action: PayloadAction< { index: number, name: string, pronoun: string, preferences: string[] } >) => {
            const user = state.users[action.payload.index];
            if (user) {
                if (user.name !== undefined) {
                    user.name = action.payload.name;
                }
                if (user.pronoun !== undefined) {
                    user.pronoun = action.payload.pronoun;
                }
                if (user.preferences !== undefined) {
                    user.preferences = action.payload.preferences;
                }
            }
        },
        updateUsers: (state, action: PayloadAction<{users: ChildType[]}>) => {
            state.users = action.payload.users;
        },
        removeUser: (state, action: PayloadAction<{ index: number }>) => {
            const user = state.users[action.payload.index];
            if (user) {
                state.users.splice(action.payload.index, 1);
            }
        },
        setType: (state, action: PayloadAction<string>) => {
            state.type = action.payload;
        },
        setNumMins: (state, action: PayloadAction<number>) => {
            state.numMins = action.payload;
        },
        setAgeRange: (state, action: PayloadAction<number[]>) => {
            state.ageRange = action.payload;
        },
        addPlot: (state, action: PayloadAction<string>) => {
            state.plots.push(action.payload);
        },
        removePlot: (state, action: PayloadAction<string>) => {
            const plot = action.payload;
            if (plot) {
                state.plots = state.plots.filter(p => p !== plot);
            }
        },
        setKeywords: (state, action: PayloadAction<boolean>) => {
            state.keywords = action.payload;
        },
        setOtherInfo: (state, action: PayloadAction<string>) => {
            state.otherInfo = action.payload;
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        setUuid: (state, action: PayloadAction<string>) => {
            state.requestUuid = action.payload;
        }
    }
});


export const { addUser, modifyUser, updateUsers, removeUser, setType, setNumMins, setAgeRange, addPlot, removePlot, setKeywords, setOtherInfo, setLanguage, setUuid } = userStorySlice.actions;
export default userStorySlice.reducer;