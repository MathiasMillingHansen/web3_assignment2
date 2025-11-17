import { Round, createRound } from './round';
import { Shuffler, standardShuffler } from '../utils/random_utils';
import { Card } from './card';

export type Game = {
    players: string[];
    playerCount: number;
    targetScore: number;
    scores: number[];
    currentRound?: Round;
    winner?: number;
};

export type Props = {
    players?: string[];
    targetScore?: number;
    randomizer?: () => number;
    shuffler?: Shuffler<Card>;
    cardsPerPlayer?: number;
};

export function createGame(props: Partial<Props> = {}): Game {
    const players = props.players ?? ['A', 'B'];
    const targetScore = props.targetScore ?? 500;
    const randomizer = props.randomizer ?? (() => Math.random());
    const shuffler = props.shuffler ?? standardShuffler;
    const cardsPerPlayer = props.cardsPerPlayer ?? 7;

    if (players.length < 2) {
        throw new Error('At least 2 players required');
    }

    if (targetScore <= 0) {
        throw new Error('Target score must be greater than 0');
    }

    const playerCount = players.length;
    const scores = Array(playerCount).fill(0);
    
    // Select random dealer
    const dealer = Math.floor(randomizer() * playerCount);
    
    const currentRound = createRound(players, dealer, shuffler, cardsPerPlayer);

    return {
        players,
        playerCount,
        targetScore,
        scores,
        currentRound,
    };
}

export function play<T>(fn: (round: Round) => T, game: Game): Game {
    if (!game.currentRound) {
        throw new Error('No current round');
    }

    fn(game.currentRound);
    
    return game;
}
