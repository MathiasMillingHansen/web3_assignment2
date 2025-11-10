import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './epics';
import gameReducer from './slices/gameSlice';

// Create the epic middleware
const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // RxJS observables aren't serializable
    }).concat(epicMiddleware),
});

// Run the root epic
epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
