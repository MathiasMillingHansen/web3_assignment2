import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api';

interface GameState {
  game: api.Game | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  game: null,
  loading: false,
  error: null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    createGameRequest: (state, action: PayloadAction<api.CreateGameRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createGameSuccess: (state, action: PayloadAction<api.CreateGameResponse>) => {
      state.loading = false;
      state.game = action.payload.game;
    },
    createGameFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    joinGameRequest: (state, action: PayloadAction<api.JoinGameRequest>) => {
      state.loading = true;
      state.error = null;
    },
    joinGameSuccess: (state, action: PayloadAction<api.JoinGameResponse>) => {
      state.loading = false;
      state.game = action.payload.game;
    },
    joinGameFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetGame: (state) => {
      state.game = null;
      state.error = null;
    },
  },
});

export const {
  createGameRequest,
  createGameSuccess,
  createGameFailure,
  joinGameRequest,
  joinGameSuccess,
  joinGameFailure,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
