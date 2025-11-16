// Client-side pure functions for UNO game state
// Server handles ALL game logic - client just displays and sends actions

import { Card, Color } from '../model/card';

// The game state shape we expect from the server
export type GameState = {
    gameId: string;
    players: string[];
    currentPlayerIndex: number;
    myPlayerIndex: number;
    myHand: Card[];
    handSizes: number[]; // Other players' hand sizes (not their actual cards)
    topCard: Card;
    currentColor?: Color;
    direction: 1 | -1;
    drawPileSize: number;
    scores: number[];
    winner?: number;
    playersWhoSaidUno?: number[]; // Track who said UNO
};

// Pure function: Get card display text
export function getCardDisplay(card: Card): string {
    if (card.type === 'WILD') return 'Wild';
    if (card.type === 'WILD DRAW') return 'Wild +4';
    
    if ('color' in card) {
        const color = card.color;
        if (card.type === 'NUMBERED') return `${color} ${card.number}`;
        if (card.type === 'SKIP') return `${color} Skip`;
        if (card.type === 'REVERSE') return `${color} Reverse`;
        if (card.type === 'DRAW') return `${color} +2`;
    }
    
    return 'Unknown';
}

// Pure function: Get card color for styling
export function getCardColor(card: Card): string {
    if (card.type === 'WILD' || card.type === 'WILD DRAW') return 'black';
    if ('color' in card) {
        return card.color.toLowerCase();
    }
    return 'gray';
}

// Pure function: Check if game has ended
export function hasGameEnded(gameState: GameState): boolean {
    return gameState.winner !== undefined;
}

// Pure function: Get current player name
export function getCurrentPlayerName(gameState: GameState): string {
    return gameState.players[gameState.currentPlayerIndex];
}
