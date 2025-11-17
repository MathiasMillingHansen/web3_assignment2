import * as api from '@/src/shared/api';
import * as db from '@/src/file_database';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto'
import { Game } from '@/src/model/game';
import { gameEvents } from '@/src/game_events';

export async function POST(request: Request) {
    let requestBody = await request.json() as api.CreateGameRequest;
    let game: Game = {
        gameId: randomUUID(),
        players: [requestBody.playerName],
        scores: [0],
        status: 'PRE-GAME',
    };
    await db.upsert('game', game.gameId, game);
    
    // Notify subscribers (in case someone is already waiting)
    gameEvents.emit(game.gameId);
    
    // Return minimal data - game state will come via SSE
    return NextResponse.json({ gameId: game.gameId, playerIndex: 0 });
}
