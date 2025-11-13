export type Game = {
    gameId: string;
    playerNames: string[];
}

export type CreateGameRequest = {
    playerName: string;
}

export type CreateGameResponse = {
    game: Game;
}

export type JoinGameRequest = {
    gameId: string;
    playerName: string;
}

export type JoinGameResponse = {
    game: Game;
}
