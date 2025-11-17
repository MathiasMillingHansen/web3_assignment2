import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Color } from '@/src/model/card';
import * as api from '@/src/shared/api';

interface GameStateSlice {
  currentGame?: api.GameState;
  isLoading: boolean;
  error: string | null;
}

const initialState: GameStateSlice = {
  currentGame: undefined,
  isLoading: false,
  error: null,
};

export const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {

    // --------------------------------------------------------------------------------------------------------------------------------
    // CreateGame

    createGameRequest: (state, _action: PayloadAction<api.CreateGameRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    createGameSuccess: (state, action: PayloadAction<api.CreateGameResponse>) => {
      state.isLoading = false;
      state.currentGame = action.payload.game;
    },
    createGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // --------------------------------------------------------------------------------------------------------------------------------
    // JoinGame

    joinGameRequest: (state, _action: PayloadAction<api.JoinGameRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    joinGameSuccess: (state, action: PayloadAction<api.JoinGameResponse>) => {
      state.isLoading = false;
      state.currentGame = action.payload.game;
    },
    joinGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // --------------------------------------------------------------------------------------------------------------------------------
    // StartGame

    startGameRequest: (state, _action: PayloadAction<api.StartGameRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    startGameSuccess: (state, action: PayloadAction<api.StartGameResponse>) => {
      state.isLoading = false;
      state.currentGame = action.payload.game;
    },
    startGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // --------------------------------------------------------------------------------------------------------------------------------
    // GetGame

    getGameRequest: (state, _action: PayloadAction<api.GetGameRequest>) => {
      state.isLoading = true;
      // Don't clear error on polling requests - let it persist
    },
    getGameSuccess: (state, action: PayloadAction<api.GetGameResponse>) => {
      state.isLoading = false;
      state.currentGame = action.payload.game;
      // Don't clear error here either - let it persist until next action
    },
    getGameFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // --------------------------------------------------------------------------------------------------------------------------------
    // PlayAction

    playActionRequest: (state, _action: PayloadAction<api.PlayActionRequest>) => {
      state.isLoading = true;
      state.error = null; // Clear error when making a new play action
    },
    playActionSuccess: (state, action: PayloadAction<api.PlayActionResponse>) => {
      state.isLoading = false;
      state.currentGame = action.payload.game;
    },
    playActionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // --------------------------------------------------------------------------------------------------------------------------------
    // Server pushes new game state (WebSocket/polling)

    updateGameState: (state, action: PayloadAction<api.GameState>) => {
      state.currentGame = action.payload;
    },

    // Reset game state
    resetGameState: (state) => {
      state.currentGame = undefined;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const actions = gameStateSlice.actions;

export default gameStateSlice.reducer;
