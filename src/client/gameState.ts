// Client-side pure functions for UNO game state
// Server handles ALL game logic - client just displays and sends actions

import { Card, Color } from '../model/card';
import { GameState } from '@/src/shared/api';

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

// Pure function: Get current player name
export function getCurrentPlayerName(gameState: GameState): string {
    if (!gameState.round) return '';
    return gameState.players[gameState.round.currentPlayerIndex];
}
