import { Game } from "@/src/model/game";
import { Round } from "@/src/model/round";
import * as api from "@/src/shared/api";

// Adapts server side 'Game' object to client expected 'GameState' object
export function gameStateForPlayer(game: Game, playerIndex: number): api.GameState {

    return {
        gameId: game.gameId,
        players: game.players,
        status: game.status,
        round: game.status === 'IN-GAME' ? {
            currentPlayerIndex: game.round.playerInTurn,
            myHand: game.round.hands[playerIndex] ?? [],
            handSizes: game.round.hands.map(x => x.length) ?? [],
            topCard: game.round.discardPile[game.round.discardPile.length - 1],
            currentColor: game.round.currentColor,
            direction: game.round.direction,
            drawPileSize: game.round.drawPile.length,
            winner: null,
        } : game.status === 'POST-GAME' ? {
            currentPlayerIndex: game.winner,
            myHand: [],
            handSizes: game.players.map(() => 0),
            topCard: { type: 'NUMBERED', color: 'RED', number: 0 }, // Dummy card
            currentColor: 'RED',
            direction: 1,
            drawPileSize: 0,
            winner: game.winner,
        } : null,
        scores: game.scores,
    };
}
