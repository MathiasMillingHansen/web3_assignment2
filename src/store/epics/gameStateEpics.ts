import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, mergeMap, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  playCardRequest,
  playCardSuccess,
  playCardFailure,
  drawCardRequest,
  drawCardSuccess,
  drawCardFailure,
  challengeUnoRequest,
  challengeUnoSuccess,
  challengeUnoFailure,
} from '../slices/gameStateSlice';

// Epic to send play card action to server
const playCardEpic: Epic = (action$) =>
  action$.pipe(
    filter(playCardRequest.match),
    mergeMap((action) => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/game/play', {
      //   method: 'POST',
      //   body: JSON.stringify(action.payload)
      // });
      // const newGameState = await response.json();
      // return of(playCardSuccess(newGameState));

      // Simulate server response
      return of(null).pipe(
        delay(500),
        map(() => {
          // Server would send back the new game state
          const mockGameState = {
            gameId: 'abc123',
            players: ['You', 'Player 2', 'Player 3'],
            currentPlayerIndex: 1,
            myPlayerIndex: 0,
            myHand: [],
            handSizes: [0, 5, 6],
            topCard: { type: 'NUMBERED' as const, color: 'RED' as const, number: 5 },
            currentColor: 'RED' as const,
            direction: 1 as const,
            drawPileSize: 50,
            scores: [0, 0, 0],
          };
          return playCardSuccess(mockGameState);
        }),
        catchError((error) => of(playCardFailure(error.message)))
      );
    })
  );

// Epic to send draw card action to server
const drawCardEpic: Epic = (action$) =>
  action$.pipe(
    filter(drawCardRequest.match),
    mergeMap(() => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/game/draw', { method: 'POST' });
      // const newGameState = await response.json();
      // return of(drawCardSuccess(newGameState));

      // Simulate server response
      return of(null).pipe(
        delay(500),
        map(() => {
          // Server sends back updated game state with new card in hand
          const mockGameState = {
            gameId: 'abc123',
            players: ['You', 'Player 2', 'Player 3'],
            currentPlayerIndex: 1,
            myPlayerIndex: 0,
            myHand: [{ type: 'NUMBERED' as const, color: 'BLUE' as const, number: 3 }],
            handSizes: [1, 5, 6],
            topCard: { type: 'NUMBERED' as const, color: 'RED' as const, number: 5 },
            direction: 1 as const,
            drawPileSize: 49,
            scores: [0, 0, 0],
          };
          return drawCardSuccess(mockGameState);
        }),
        catchError((error) => of(drawCardFailure(error.message)))
      );
    })
  );

// Epic to send UNO challenge to server
const challengeUnoEpic: Epic = (action$) =>
  action$.pipe(
    filter(challengeUnoRequest.match),
    mergeMap((action) => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/game/challenge-uno', {
      //   method: 'POST',
      //   body: JSON.stringify({ targetPlayerIndex: action.payload.targetPlayerIndex })
      // });
      // const newGameState = await response.json();
      // return of(challengeUnoSuccess(newGameState));

      // Simulate server response
      return of(null).pipe(
        delay(500),
        map(() => {
          // Server validates and updates game state
          const mockGameState = {
            gameId: 'abc123',
            players: ['You', 'Player 2', 'Player 3'],
            currentPlayerIndex: 0,
            myPlayerIndex: 0,
            myHand: [{ type: 'NUMBERED' as const, color: 'BLUE' as const, number: 3 }],
            handSizes: [1, 7, 6], // Player 2 got penalized with 2 cards
            topCard: { type: 'NUMBERED' as const, color: 'RED' as const, number: 5 },
            direction: 1 as const,
            drawPileSize: 48,
            scores: [0, 0, 0],
          };
          return challengeUnoSuccess(mockGameState);
        }),
        catchError((error) => of(challengeUnoFailure(error.message)))
      );
    })
  );

export const gameStateEpics = combineEpics(
  playCardEpic,
  drawCardEpic,
  challengeUnoEpic
);
