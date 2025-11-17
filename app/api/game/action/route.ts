import * as api from '@/src/shared/api';
import { NextResponse } from 'next/server';
import * as db from '@/src/file_database';
import { Game, InGame, PostGame } from '@/src/model/game';
import { gameStateForPlayer } from '../util';
import { playAction, PlayResult } from '@/src/model/round';

function gameFromPlayResult(game: InGame, play: PlayResult): InGame | PostGame {
    if (play.type == 'OK'){
        return { ...game, round: play.round };
    }

    if (play.type == 'WINNER'){
        return { ...game, status: 'POST-GAME', round: play.round, winner: play.winnerIndex }
    }

    throw new Error(`Unexpected play result: ${play.type}`);
}

export async function POST(request: Request) {
    const requestBody = await request.json() as api.PlayActionRequest;
    const game = await db.find<Game>('game', requestBody.gameId);
    if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'IN-GAME') {
        return NextResponse.json({ error: 'Game not active' }, { status: 400 });
    }

    const playResult = playAction(game.round, requestBody.playerIndex, requestBody.action);
    if (playResult.type == 'ERROR') {
        return NextResponse.json({ error: playResult.message }, { status: 400 });
    }

    let gameAfterPlay = gameFromPlayResult(game, playResult);
    await db.upsert('game', game.gameId, gameAfterPlay);

    const responseBody: api.PlayActionResponse = { game: gameStateForPlayer(gameAfterPlay, requestBody.playerIndex) };
    const response = NextResponse.json(responseBody);
    return response;
}
