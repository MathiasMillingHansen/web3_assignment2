import * as api from '@/src/api';
import { NextResponse } from 'next/server';
import { GLOBAL_GAME_STORE } from '@/src/game-store';

export async function POST(request: Request) {
    const body = await request.json() as api.CreateGameRequest;
    let game = GLOBAL_GAME_STORE.create(body.playerName);
    let response: api.CreateGameResponse = { game };
    console.log('[server]', GLOBAL_GAME_STORE.games);
    console.log(`[server] game created with id: ${game.gameId} by player: ${body.playerName}`);
    console.log('[server]', GLOBAL_GAME_STORE.games);
    return NextResponse.json(response);
}
