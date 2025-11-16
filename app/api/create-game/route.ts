import * as api from '@/src/api';
import * as db from '@/src/file_database';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
    let requestBody = await request.json() as api.CreateGameRequest;
    let game: api.Game = {
        gameId: randomUUID(),
        playerNames: [requestBody.playerName],
    };
    await db.upsert('games', game.gameId, game);
    let responseBody: api.CreateGameResponse = { game };
    return NextResponse.json(responseBody);
}
