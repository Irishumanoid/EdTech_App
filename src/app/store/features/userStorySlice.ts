import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChildType {
    name: string;
    pronoun: string;
    preferences: string[];
  };

interface userStoryState {
    users: ChildType[],
    contentType: string,
    numMins: number,
    lowerAge: number,
    upperAge: number,
    plots: string[],
    keywords: boolean,
    otherInfo: string,
    language: string
}

const initialState: userStoryState = {
    users: [],
    contentType: '',
    numMins: 0,
    lowerAge: 0,
    upperAge: 0,
    plots: [],
    keywords: false,
    otherInfo: '',
    language: ''
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
        removeUser: (state, action: PayloadAction<number>) => {
            const user = state.users[action.payload];
            if (user) {
                state.users.splice(action.payload, 1);
            }
        },
        setContentType: (state, action: PayloadAction<string>) => {
            state.contentType = action.payload;
        },
        setNumMins: (state, action: PayloadAction<number>) => {
            state.numMins = action.payload;
        },
        setLowerAge: (state, action: PayloadAction<number>) => {
            state.lowerAge = action.payload;
        },
        setUpperAge: (state, action: PayloadAction<number>) => {
            state.upperAge = action.payload;
        },
        addPlot: (state, action: PayloadAction<string>) => {
            state.plots.push(action.payload);
        },
        removePlot: (state, action: PayloadAction<number>) => {
            const plot = state.plots[action.payload];
            if (plot) {
                state.plots.splice(action.payload, 1);
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
    }
});


export const { addUser, modifyUser, removeUser, setContentType, setNumMins, setLowerAge, setUpperAge, addPlot, removePlot, setKeywords, setOtherInfo, setLanguage } = userStorySlice.actions;
export default userStorySlice.reducer;