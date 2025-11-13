import nextConfig from '@/next.config';
import * as api from '@/src/api';

class GameStore {
    private games: Map<string, api.Game> = new Map();
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

    get(gameId: string): api.Game {
        let game = this.games.get(gameId);
        if (!game) throw new Error('Game id not found');
        return game;
    }
}

export const GLOBAL_GAME_STORE = new GameStore();


