import * as api from '@/src/shared/api';
import { NextResponse } from 'next/server';
import * as db from '@/src/file_database';
import { Game } from '@/src/model/game';
import { gameStateForPlayer } from '../util';

export async function POST(request: Request) {
    let requestBody = await request.json() as api.JoinGameRequest;
    let game = await db.find<Game>('game', requestBody.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'PRE-GAME') {
        return NextResponse.json({ error: 'Cannot join a game that has already started' }, { status: 400 });
    }

    if (game.players.includes(requestBody.playerName)) {
        return NextResponse.json({ error: 'Player name already taken in this game' }, { status: 400 });
    }

    game.players.push(requestBody.playerName);
    await db.upsert<Game>('game', game.gameId, game);

    let gameState = gameStateForPlayer(game, game.players.length - 1)!;
    let responseBody: api.JoinGameResponse = { game: gameState };
    let response = NextResponse.json(responseBody)
    return response;
}
