import * as api from '@/src/api';
import { NextResponse } from 'next/server';
import { GLOBAL_GAME_STORE } from '@/src/game-store';

export async function POST(request: Request) {
    const body = await request.json() as api.JoinGameRequest;
    console.log('[server]', GLOBAL_GAME_STORE.games);
    console.log(`[server] join game request for game id: ${body.gameId} by player: ${body.playerName}`);
    let game = GLOBAL_GAME_STORE.get(body.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.playerNames.includes(body.playerName)) {
        return NextResponse.json({ error: 'Player name already taken in this game' }, { status: 400 });
    }

    console.log(`[server] player ${body.playerName} joined game id: ${game.gameId}`);

    let response: api.JoinGameResponse = { game };
    return NextResponse.json(response);
}
