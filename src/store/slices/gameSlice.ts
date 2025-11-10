import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  gameId: string | null;
  players: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  gameId: null,
  players: [],
  isLoading: false,
  error: null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    createGameRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createGameSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.gameId = action.payload;
    },
    createGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    joinGameRequest: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    joinGameSuccess: (state, action: PayloadAction<{ gameId: string; players: string[] }>) => {
      state.isLoading = false;
      state.gameId = action.payload.gameId;
      state.players = action.payload.players;
    },
    joinGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetGame: (state) => {
      state.gameId = null;
      state.players = [];
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
