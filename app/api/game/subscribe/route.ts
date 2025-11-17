import { NextRequest } from 'next/server';
import { gameEvents } from '@/src/game_events';
import * as db from '@/src/file_database';
import { Game } from '@/src/model/game';
import { gameStateForPlayer } from '../util';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('gameId');
  const playerIndex = parseInt(searchParams.get('playerIndex') ?? '0');

  if (!gameId) {
    return new Response('Missing gameId', { status: 400 });
  }

  // Set up SSE headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial game state
      const sendGameState = async () => {
        try {
          console.log(`[SSE] Sending game state for game ${gameId}, player ${playerIndex}`);
          const game = await db.find<Game>('game', gameId);
          if (game) {
            const gameState = gameStateForPlayer(game, playerIndex);
            const data = `data: ${JSON.stringify(gameState)}\n\n`;
            controller.enqueue(encoder.encode(data));
            console.log(`[SSE] Game state sent successfully`);
          } else {
            console.log(`[SSE] Game ${gameId} not found`);
          }
        } catch (error) {
          console.error('Error sending game state:', error);
        }
      };

      // Send initial state
      sendGameState();

      // Subscribe to game updates
      const unsubscribe = gameEvents.subscribe(gameId, () => {
        sendGameState();
      });

      // Keep connection alive with heartbeat
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
