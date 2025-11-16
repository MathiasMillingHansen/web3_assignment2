import next from 'next';
import { GameAction } from '../shared/api';
import { Shuffler } from '../utils/random_utils'
import { Card, Color } from './card'
import { createInitialDeck } from './deck';
import * as _ from 'lodash'

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
            return true;
        } break;

        case 'WILD DRAW': {
            if (!hand.some(c => 'color' in c && c.color === topColor)) return true;
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
        return { type: 'OK', round: roundAfterEffect };
    }

    if (action.type == 'DRAW_CARD') {
        return { type: 'OK', round: _.flow(drawCard, nextPlayer)(round) };
    }

    throw new Error(`Action not yet implemented: ${action.type}`);
}
