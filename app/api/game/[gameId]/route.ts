import { NextResponse } from 'next/server';
import { GLOBAL_GAME_STORE } from '@/src/game-store';

export async function GET(request: Request, context: { params: { gameId: string } }) {
    const game = GLOBAL_GAME_STORE.get(context.params.gameId);
    if (!game) return NextResponse.json('Game not found', { status: 404 });
    return NextResponse.json(game, { status: 200 });
}
