
import { Card, Color } from '@/src/model/card'
import { GameStatus } from '@/src/model/game';

export type GameState = {
    gameId: string;
    players: string[];
    status: GameStatus;
    round: RoundState | null;
    scores: number[];
};

export type RoundState = {
    currentPlayerIndex: number;
    myHand: Card[];
    handSizes: number[];
    topCard: Card;
    currentColor: Color;
    direction: 1 | -1;
    drawPileSize: number;
    winner: number | null;
}

export type GameAction =
    | { type: 'PLAY_CARD'; cardIndex: number; chosenColor?: Color }
    | { type: 'DRAW_CARD' }
    | { type: 'SAY_UNO' }
    | { type: 'CHALLENGE_UNO'; targetPlayer: number };

export function playCardAction(cardIndex: number, chosenColor?: Color): GameAction {
    return { type: 'PLAY_CARD', cardIndex, chosenColor };
}

export function drawCardAction(): GameAction {
    return { type: 'DRAW_CARD' };
}

export function sayUnoAction(): GameAction {
    return { type: 'SAY_UNO' };
}

export function challengeUnoAction(targetPlayer: number): GameAction {
    return { type: 'CHALLENGE_UNO', targetPlayer };
}


export type GetGameRequest = { gameId: string; playerIndex: number; }
export type GetGameResponse = { game: GameState; }

export type CreateGameRequest = { playerName: string; }
export type CreateGameResponse = { game: GameState; }

export type JoinGameRequest = { gameId: string; playerName: string; }
export type JoinGameResponse = { game: GameState; }

export type StartGameRequest = { gameId: string; playerIndex: number; }
export type StartGameResponse = { game: GameState; }

export type PlayActionRequest = { gameId: string, playerIndex: number; action: GameAction }
export type PlayActionResponse = { game: GameState }
