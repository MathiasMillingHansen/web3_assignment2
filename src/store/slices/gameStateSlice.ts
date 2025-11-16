import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '@/src/client/gameState';
import { Color } from '@/src/model/card';

interface GameStateSlice {
  currentGame?: GameState;
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
    // Play card - send to server
    playCardRequest: (state, _action: PayloadAction<{ cardIndex: number; chosenColor?: Color }>) => {
      state.isLoading = true;
      state.error = null;
    },
    playCardSuccess: (state, action: PayloadAction<GameState>) => {
      state.isLoading = false;
      state.currentGame = action.payload; // Server sends new state
    },
    playCardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Draw card - send to server
    drawCardRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    drawCardSuccess: (state, action: PayloadAction<GameState>) => {
      state.isLoading = false;
      state.currentGame = action.payload; // Server sends new state with card
    },
    drawCardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Challenge UNO - send to server
    challengeUnoRequest: (state, _action: PayloadAction<{ targetPlayerIndex: number }>) => {
      state.isLoading = true;
      state.error = null;
    },
    challengeUnoSuccess: (state, action: PayloadAction<GameState>) => {
      state.isLoading = false;
      state.currentGame = action.payload;
    },
    challengeUnoFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Server pushes new game state (WebSocket/polling)
    updateGameState: (state, action: PayloadAction<GameState>) => {
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

export const {
  playCardRequest,
  playCardSuccess,
  playCardFailure,
  drawCardRequest,
  drawCardSuccess,
  drawCardFailure,
  challengeUnoRequest,
  challengeUnoSuccess,
  challengeUnoFailure,
  updateGameState,
  resetGameState,
} = gameStateSlice.actions;

export default gameStateSlice.reducer;
