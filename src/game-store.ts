import * as api from '@/src/api';

class GameStore {
    public games: Map<string, api.Game> = new Map();
    private nextGameId: number = 1;

    create(playerName: string): api.Game {
        let gameId = (this.nextGameId++).toString();
        let game: api.Game = {
            gameId,
            playerNames: [playerName],
        };

        this.games.set(gameId, game);
        return game;
    }

    get(gameId: string): api.Game | null {
        let game = this.games.get(gameId);
        return game ?? null;
    }
}

export const GLOBAL_GAME_STORE = new GameStore();


