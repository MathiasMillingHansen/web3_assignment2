import next from 'next';
import { GameAction } from '../shared/api';
import { Shuffler } from '../utils/random_utils'
import { Card, Color } from './card'
import { createInitialDeck } from './deck';
import * as _ from 'lodash'

// Helper to ensure saidUno is always an array (handles migration from old Set/object format)
function ensureSaidUnoArray(value: any): number[] {
    if (Array.isArray(value)) return value;
    if (value instanceof Set) return Array.from(value);
    // Handle old empty object {} or other formats
    return [];
}

export type Round = {
    hands: Card[][],
    discardPile: Card[],
    drawPile: Card[],
    playerInTurn: number,
    playerCount: number
    players: string[],
    dealer: number,
    currentColor: Color; // Matches color of last in discardPile, expect for wild cards, then currentColor is the chosen color.
    direction: 1 | -1;
    saidUno: number[]; // Track which players have said UNO
}

// --------------------------------------------------------------------------------------------------------------------------------
// Creating a round

export function createRound(players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Round {
    if (players.length < 2) throw new Error('At least 2 players required');
    if (players.length > 10) throw new Error('At most 10 players allowed');
    if (dealer >= players.length) throw new Error('Dealer index out of range');

    const playerCount = players.length;

    const initialCards = createInitialDeck();
    const shuffledCards = shuffler(initialCards);

    const totalCardsToDeal = playerCount * cardsPerPlayer;

    const cardsToDeal = shuffledCards.slice(0, totalCardsToDeal);
    const firstCard = shuffledCards[totalCardsToDeal]
    const drawPile = shuffledCards.slice(totalCardsToDeal + 1);

    if (firstCard.type == 'WILD' || firstCard.type == 'WILD DRAW') {
        return createRound(players, dealer, shuffler, cardsPerPlayer);
    }

    const hands = players.map((_, index) => cardsToDeal.slice((index * cardsPerPlayer), (index * cardsPerPlayer + cardsPerPlayer)));
    const playerInTurn = 0;

    return {
        players,
        playerCount,
        dealer,
        playerInTurn,
        drawPile,
        discardPile: [firstCard],
        currentColor: firstCard.color,
        hands,
        direction: 1,
        saidUno: [],
    };
}

// --------------------------------------------------------------------------------------------------------------------------------
// Playing a card

export type PlayContinue = {
    type: 'OK';
    round: Round;
}

export type PlayWinner = {
    type: 'WINNER';
    round: Round;
    winnerIndex: number,
}

export type PlayError = {
    type: 'ERROR';
    message: string;
}

export type PlayResult = PlayContinue | PlayWinner | PlayError;

function isPlayable(card: Card, hand: Card[], topCard: Card, topColor: Color): boolean {
    switch (card.type) {
        case 'WILD': {
            // Regular wild cards can be played anytime
            return true;
        } break;

        case 'WILD DRAW': {
            // Wild Draw +4 can only be played if no other cards are playable
            return !hand.some(c => {
                if (c === card) return false; // Don't check the wild draw itself
                if (c.type === 'WILD' || c.type === 'WILD DRAW') return false; // Don't check other wild cards
                
                // Check if this card matches color
                if ('color' in c && c.color === topColor) return true;
                
                // Check if numbered card matches number
                if (c.type === 'NUMBERED' && topCard.type === 'NUMBERED' && c.number === topCard.number) return true;
                
                // Check if special card matches type
                if ((c.type === 'REVERSE' || c.type === 'SKIP' || c.type === 'DRAW') && c.type === topCard.type) return true;
                
                return false;
            });
        } break;

        case 'REVERSE':
        case 'SKIP':
        case 'DRAW': {
            if (topCard.type === card.type) return true;
            if (topColor === card.color) return true;
        } break;

        case 'NUMBERED': {
            if (topCard.type === 'NUMBERED' && topCard.number === card.number) return true;
            if (topColor === card.color) return true;
        } break;
    }

    return false;
}

function nextPlayer(round: Round): Round {
    return {
        ...round,
        saidUno: ensureSaidUnoArray(round.saidUno),
        playerInTurn: (round.playerInTurn + round.direction + round.players.length) % round.players.length
    };
}

const drawCardsToPlayer = (round: Round, playerIndex: number, count: number): Round => {
    const card = round.drawPile.slice(0, count);
    if (card.length === 0) {
        return round;
    }
    return {
        ...round,
        saidUno: ensureSaidUnoArray(round.saidUno),
        hands: round.hands.map((hand, index) => index === playerIndex ? [...hand, ...card] : hand),
        drawPile: round.drawPile.slice(count)
    };
};

const drawCard = (round: Round): Round => {
    return drawCardsToPlayer(round, round.playerInTurn, 1);
}

function swapDirection(round: Round): Round {
    return {
        ...round,
        saidUno: ensureSaidUnoArray(round.saidUno),
        direction: round.direction == 1 ? -1 : 1,
    };
}

function colorAfterPlay(card: Card, chosenColor?: Color): Color | null {
    switch (card.type) {
        case 'WILD':
        case 'WILD DRAW':
            if (!chosenColor) {
                return null;
            }
            return chosenColor;

        default:
            if (chosenColor) {
                return null;
            }
            return card.color;
    }
}

function applyCardEffect(round: Round, card: Card): Round {
    switch (card.type) {
        case 'WILD':
        case 'NUMBERED':
            return _.flow(nextPlayer)(round);

        case 'REVERSE':
            if (round.players.length === 2) {
                return _.flow(nextPlayer, nextPlayer)(round);
            } else {
                return _.flow(swapDirection, nextPlayer)(round);
            }

        case 'SKIP':
            return _.flow(nextPlayer, nextPlayer)(round);

        case 'DRAW':
            return _.flow(nextPlayer, drawCard, drawCard, nextPlayer)(round);

        case 'WILD DRAW':
            return _.flow(nextPlayer, drawCard, drawCard, drawCard, drawCard, nextPlayer)(round)
    }
}

export function playAction(round: Round, playerIndex: number, action: GameAction): PlayResult {
    if (action.type == 'PLAY_CARD') {
        const cardIndex = action.cardIndex;
        const chosenColor = action.chosenColor;
        const hand = round.hands[playerIndex];
        if (!hand) {
            return { type: 'ERROR', message: 'Invalid player index' };
        }

        const card = hand[cardIndex];
        if (!card) {
            return { type: 'ERROR', message: 'Invalid card index' };
        }

        if (playerIndex != round.playerInTurn) {
            return { type: 'ERROR', message: 'Not your turn' };
        }

        // Valid card to play?
        const topCard = round.discardPile[round.discardPile.length - 1];
        const topColor = round.currentColor;
        if (!isPlayable(card, hand, topCard, topColor)) {
            return { type: 'ERROR', message: 'Cannot play card' };
        }

        // Card color or chosen?
        const newCurrentColor = colorAfterPlay(card, chosenColor);
        if (!newCurrentColor) {
            return { type: 'ERROR', message: chosenColor ? 'Cannot chose color for this card' : 'Must chose color for this card' };
        }

        // Move card from hand to discard
        const newHand = hand.filter((_, index) => index !== cardIndex);
        const newHands = round.hands.map((oldHand, index) => (index === playerIndex ? newHand : oldHand));
        const newDiscardPile = [...round.discardPile, card];
        const roundAfterPlay: Round = {
            ...round,
            hands: newHands,
            discardPile: newDiscardPile,
            currentColor: newCurrentColor,
        };

        if (newHand.length === 0) {
            return { type: 'WINNER', round: roundAfterPlay, winnerIndex: playerIndex };
        }

        const roundAfterEffect: Round = applyCardEffect(roundAfterPlay, card);
        
        // Only clear UNO flag if player no longer has exactly 1 card
        // (they either won with 0 cards, or drew cards and now have more than 1)
        let newSaidUno = ensureSaidUnoArray(roundAfterEffect.saidUno);
        console.log(`[UNO] After playing card, player ${playerIndex} has ${newHand.length} cards. saidUno before:`, newSaidUno);
        if (newHand.length !== 1) {
            newSaidUno = newSaidUno.filter((p: number) => p !== playerIndex);
            console.log(`[UNO] Cleared UNO flag for player ${playerIndex}. saidUno after:`, newSaidUno);
        } else {
            console.log(`[UNO] Keeping UNO flag for player ${playerIndex} (still has 1 card)`);
        }
        
        return { type: 'OK', round: { ...roundAfterEffect, saidUno: newSaidUno } };
    }

    if (action.type == 'DRAW_CARD') {
        const roundAfterDraw = _.flow(drawCard, nextPlayer)(round);
        // Clear UNO flag when drawing (player no longer has 1 card)
        const newSaidUno = ensureSaidUnoArray(roundAfterDraw.saidUno).filter((p: number) => p !== playerIndex);
        return { type: 'OK', round: { ...roundAfterDraw, saidUno: newSaidUno } };
    }
    
    if (action.type == 'SAY_UNO') {
        // Mark that this player has said UNO
        const currentSaidUno = ensureSaidUnoArray(round.saidUno);
        const newSaidUno = currentSaidUno.includes(playerIndex) 
            ? currentSaidUno 
            : [...currentSaidUno, playerIndex];
        console.log(`[UNO] Player ${playerIndex} said UNO. Current saidUno:`, newSaidUno);
        return { type: 'OK', round: { ...round, saidUno: newSaidUno } };
    }
    
    if (action.type == 'CHALLENGE_UNO') {
        const targetIndex = action.targetPlayer;
        const saidUnoArray = ensureSaidUnoArray(round.saidUno);
        
        console.log(`[UNO] Player ${playerIndex} challenging player ${targetIndex}`);
        console.log(`[UNO] Target has ${round.hands[targetIndex]?.length} cards`);
        console.log(`[UNO] saidUno array:`, saidUnoArray);
        console.log(`[UNO] Target in saidUno array?`, saidUnoArray.includes(targetIndex));
        
        // Check if target player has exactly 1 card and hasn't said UNO
        if (round.hands[targetIndex]?.length === 1 && !saidUnoArray.includes(targetIndex)) {
            // Challenge successful! Target draws 2 cards as penalty
            console.log(`[UNO] Challenge successful! Player ${targetIndex} draws 2 cards`);
            const roundAfterPenalty = drawCardsToPlayer(round, targetIndex, 2);
            return { type: 'OK', round: roundAfterPenalty };
        }
        
        // Challenge failed or invalid - challenger might draw penalty
        console.log(`[UNO] Challenge failed!`);
        return { type: 'ERROR', message: 'Invalid UNO challenge' };
    }

    const _exhaustiveCheck: never = action;
    throw new Error(`Action not yet implemented: ${(action as any).type}`);
}
