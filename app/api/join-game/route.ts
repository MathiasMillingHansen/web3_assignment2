import * as api from '@/src/api';
import { NextResponse } from 'next/server';
import * as db from '@/src/file_database';

// TODO(rune): This is a bit racey

export async function POST(request: Request) {
    let requestBody = await request.json() as api.JoinGameRequest;
    let game = await db.find<api.Game>('games', requestBody.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.playerNames.includes(requestBody.playerName)) {
        return NextResponse.json({ error: 'Player name already taken in this game' }, { status: 400 });
    }

    game.playerNames.push(requestBody.playerName);
    await db.upsert<api.Game>('games', game.gameId, game);

    let responseBody: api.JoinGameResponse = { game };
    let response = NextResponse.json(responseBody)
    return response;
}
