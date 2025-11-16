import { Round } from "./round";

export type GameBase = {
    gameId: string;
    players: string[];
};

export type PreGame = GameBase & {
    status: 'PRE-GAME';
};

export type InGame = GameBase & {
    status: 'IN-GAME';
    round: Round;
};

export type PostGame = GameBase & {
    status: 'POST-GAME';
    round: Round;
    winner: number;
};

export type Game = PreGame | InGame | PostGame;

export type GameStatus = Game['status'];
