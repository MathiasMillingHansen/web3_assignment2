import { Card } from './card';
import { Round } from './round';

// Calculate points for a single card according to official UNO rules
export function getCardPoints(card: Card): number {
    switch (card.type) {
        case 'NUMBERED':
            return card.number;
        case 'SKIP':
        case 'REVERSE':
        case 'DRAW':
            return 20;
        case 'WILD':
        case 'WILD DRAW':
            return 50;
        default:
            return 0;
    }
}

// Calculate total points in a hand
export function calculateHandPoints(hand: Card[]): number {
    return hand.reduce((total, card) => total + getCardPoints(card), 0);
}

// Calculate scores after a round ends
// The winner gets points equal to the sum of all other players' hands
export function calculateRoundScores(round: Round, winnerIndex: number): number[] {
    const scores = Array(round.playerCount).fill(0);
    
    // Sum up all cards from losing players
    let totalPoints = 0;
    round.hands.forEach((hand, index) => {
        if (index !== winnerIndex) {
            totalPoints += calculateHandPoints(hand);
        }
    });
    
    // Winner gets all the points
    scores[winnerIndex] = totalPoints;
    
    return scores;
}
