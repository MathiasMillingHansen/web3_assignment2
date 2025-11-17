import * as api from '@/src/shared/api';
import * as db from '@/src/file_database';
import { NextResponse } from 'next/server';
import { Game } from '@/src/model/game';
import { gameStateForPlayer } from '../util';

export async function POST(request: Request) {
    let requestBody = await request.json() as api.GetGameRequest;

    let game = await db.find<Game>('game', requestBody.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    let gameState = gameStateForPlayer(game, requestBody.playerIndex);
    let responseBody: api.GetGameResponse = { game: gameState };
    let response = NextResponse.json(responseBody);
    return response;
}
