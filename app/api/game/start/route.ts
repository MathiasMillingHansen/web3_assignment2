import * as api from '@/src/shared/api';
import * as db from '@/src/file_database';
import { NextResponse } from 'next/server';
import { Game } from '@/src/model/game';
import { createReadStream } from 'fs';
import { createRound } from '@/src/model/round';
import { standardShuffler } from '@/src/utils/random_utils';
import { gameStateForPlayer } from '../util';
import { gameEvents } from '@/src/game_events';

export async function POST(request: Request) {
    let requestBody = await request.json() as api.StartGameRequest;
    let game = await db.find<Game>('game', requestBody.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (requestBody.playerIndex !== 0) {
        return NextResponse.json({ error: 'Only the first player can start the game' }, { status: 400 });
    }

    if (game.status !== 'PRE-GAME') {
        return NextResponse.json({ error: 'Game has not started yet' }, { status: 400 });
    }

    if (game.players.length < 2) {
        return NextResponse.json({ error: 'Not enough players to start the game' }, { status: 400 });
    }

    game.round = createRound(game.players, 0, standardShuffler, 7);
    game.status = 'IN-GAME';
    await db.upsert<Game>('game', game.gameId, game);
    
    console.log(`[StartGame] Game ${game.gameId} started, emitting event...`);
    // Notify all subscribers of the game state change
    gameEvents.emit(game.gameId);
    console.log(`[StartGame] Event emitted for game ${game.gameId}`);

    // Return success - game state update will come via SSE
    return NextResponse.json({ success: true });
}
