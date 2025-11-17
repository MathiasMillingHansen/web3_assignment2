import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, mergeMap, delay, takeUntil } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as slice from '../slices/gameStateSlice';
import * as api from '@/src/shared/api';
import { errorMessageFromAjax } from './util';

const createGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.createGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<{ gameId: string; playerIndex: number }>('/api/game/create', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.createGameSuccess(response.response)),
          catchError(error => of(slice.actions.createGameFailure(errorMessageFromAjax(error))))
        )
    )
  );

const joinGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.joinGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<{ playerIndex: number }>('/api/game/join', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.joinGameSuccess({ 
            playerIndex: response.response.playerIndex,
            gameId: action.payload.gameId 
          })),
          catchError(error => of(slice.actions.joinGameFailure(errorMessageFromAjax(error))))
        )
    )
  );

const startGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.startGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<{ success: boolean }>('/api/game/start', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(() => slice.actions.startGameSuccess()),
          catchError(error => of(slice.actions.startGameFailure(errorMessageFromAjax(error))))
        )
    )
  );

const getGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.getGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<api.GetGameResponse>('/api/game/get', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.getGameSuccess(response.response)),
          catchError(error => of(slice.actions.getGameFailure(errorMessageFromAjax(error))))
        )
    )
  );

const playActionEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.playActionRequest.match),
    mergeMap((action) => {
      return ajax
        .post<{ success: boolean }>('/api/game/action', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(() => slice.actions.playActionSuccess()),
          catchError(error => of(slice.actions.playActionFailure(errorMessageFromAjax(error))))
        )
    })
  );

const subscribeToGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.subscribeToGameRequest.match),
    mergeMap((action) => {
      const { gameId, playerIndex } = action.payload;
      console.log(`[Epic] Subscribing to game ${gameId} for player ${playerIndex}`);
      
      return new Observable((subscriber) => {
        const eventSource = new EventSource(`/api/game/subscribe?gameId=${gameId}&playerIndex=${playerIndex}`);
        
        eventSource.onopen = () => {
          console.log(`[Epic] SSE connection opened for game ${gameId}`);
        };
        
        eventSource.onmessage = (event) => {
          try {
            console.log(`[Epic] Received SSE message:`, event.data);
            const gameState = JSON.parse(event.data) as api.GameState;
            subscriber.next(slice.actions.gameStateUpdate(gameState));
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
          subscriber.error(error);
        };
        
        // Cleanup on unsubscribe
        return () => {
          console.log(`[Epic] Closing SSE connection for game ${gameId}`);
          eventSource.close();
        };
      }).pipe(
        takeUntil(action$.pipe(filter(slice.actions.unsubscribeFromGame.match))),
        catchError(error => of(slice.actions.getGameFailure('Connection error')))
      );
    })
  );

export const gameStateEpics = combineEpics(
  createGameEpic,
  joinGameEpic,
  startGameEpic,
  getGameEpic,
  playActionEpic,
  subscribeToGameEpic,
);
