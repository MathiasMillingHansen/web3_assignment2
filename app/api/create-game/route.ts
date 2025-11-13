import * as api from '@/src/api';
import { NextResponse } from 'next/server';
import { GLOBAL_GAME_STORE } from '@/src/game-store';

export async function POST(request: Request) {
    const body = await request.json() as api.CreateGameRequest;
    let game = GLOBAL_GAME_STORE.create(body.playerName);
    let response: api.CreateGameResponse = { game };
    return NextResponse.json(response);
}
