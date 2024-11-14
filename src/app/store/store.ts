import { configureStore } from '@reduxjs/toolkit'
import userStorySlice from './features/userStorySlice'

const store = configureStore({
  reducer: {
    user: userStorySlice,
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
