// Client-side action creators for game interactions
// These prepare data to send to the server

import { Color } from '../model/card';

export type GameAction = 
    | { type: 'PLAY_CARD'; cardIndex: number; chosenColor?: Color }
    | { type: 'DRAW_CARD' }
    | { type: 'SAY_UNO' }
    | { type: 'CHALLENGE_UNO'; targetPlayer: number };

// Create action to play a card
export function playCard(cardIndex: number, chosenColor?: Color): GameAction {
    return { type: 'PLAY_CARD', cardIndex, chosenColor };
}

// Create action to draw a card
export function drawCard(): GameAction {
    return { type: 'DRAW_CARD' };
}

// Create action to say UNO
export function sayUno(): GameAction {
    return { type: 'SAY_UNO' };
}

// Create action to challenge another player's UNO call
export function challengeUno(targetPlayer: number): GameAction {
    return { type: 'CHALLENGE_UNO', targetPlayer };
}

// Helper: Convert action to API request payload
export function actionToPayload(action: GameAction, gameId: string) {
    return {
        gameId,
        action: action.type,
        data: action,
    };
}
