import * as api from '@/src/shared/api';
import * as db from '@/src/file_database';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto'
import { Game } from '@/src/model/game';
import { gameStateForPlayer } from '../util';

export async function POST(request: Request) {
    let requestBody = await request.json() as api.CreateGameRequest;
    let game: Game = {
        gameId: randomUUID(),
        players: [requestBody.playerName],
        status: 'PRE-GAME',
    };
    await db.upsert('game', game.gameId, game);
    let gameState = gameStateForPlayer(game, 0)!;
    let responseBody: api.CreateGameResponse = { game: gameState };
    return NextResponse.json(responseBody);
}
