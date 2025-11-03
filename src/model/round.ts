import { Shuffler } from '../utils/random_utils'
import { type Card } from './card'
import { createInitialDeck } from './deck';

export type Round = {
    hands: Card[][],
    discardPile: Card[],
    drawPile: Card[],
    playerInTurn: number,
    playerCount: number
    players: string[],
    dealer: number,
}

export function createRound(players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Round
{
    if (players.length < 2) throw new Error('At least 2 players required');
    if (players.length > 10) throw new Error('At most 10 players allowed');
    if (dealer >= players.length) throw new Error('Dealer index out of range');

    let playerCount = players.length;

    let initialCards = createInitialDeck();
    let shuffledCards = shuffler(initialCards);

    let totalCardsToDeal = playerCount * cardsPerPlayer;

    let cardsToDeal = shuffledCards.slice(0, totalCardsToDeal);
    let firstCard = shuffledCards[totalCardsToDeal]
    let drawPile = shuffledCards.slice(totalCardsToDeal + 1);

    if (firstCard.type == 'WILD' || firstCard.type == 'WILD DRAW')
    {
        return createRound(players, dealer, shuffler, cardsPerPlayer);
    }

    let hands = players.map((_, index) => cardsToDeal.slice((index * cardsPerPlayer), (index * cardsPerPlayer + cardsPerPlayer)));
    let playerInTurn = 0;

    return {
        players,
        playerCount,
        dealer,
        playerInTurn,
        drawPile,
        discardPile: [firstCard],
        hands,
    };
}
