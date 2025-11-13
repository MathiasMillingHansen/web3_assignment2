import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as slice from '../slices/gameSlice';

import * as api from '@/src/api';

// Epic for creating a game
const createGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.createGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<api.CreateGameResponse>(
          '/api/create-game',
          action.payload,
          { 'Content-Type': 'application/json' }
        )
        .pipe(
          map((response) => slice.createGameSuccess(response.response)),
          catchError((error) => of(slice.createGameFailure(error.ajaxError.message)))
        )
    )
  );

// Epic for joining a game (remains unchanged)
const joinGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.joinGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<api.JoinGameResponse>(
          '/api/join-game',
          action.payload,
          { 'Content-Type': 'application/json' }
        )
        .pipe(
          map((response) => slice.joinGameSuccess(response.response)),
          catchError((error) => of(slice.joinGameFailure(error.ajaxError.message)))
        )
    )
  );

export const gameEpics = combineEpics(createGameEpic, joinGameEpic);
