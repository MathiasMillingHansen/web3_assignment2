import { NextResponse } from 'next/server';
import * as db from '@/src/file_database';
import * as api from '@/src/api';

export async function GET(request: Request, context: { params: Promise<{ gameId: string }> }) {
    let params = await context.params;
    let game = await db.find<api.Game>('games', params.gameId);
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    return NextResponse.json(game, { status: 200 });
}
