import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, mergeMap, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as slice from '../slices/gameStateSlice';
import * as api from '@/src/shared/api';
import { errorMessageFromAjax } from './util';

const createGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.createGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<api.CreateGameResponse>('/api/game/create', action.payload, { 'Content-Type': 'application/json' })
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
        .post<api.JoinGameResponse>('/api/game/join', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.joinGameSuccess(response.response)),
          catchError(error => of(slice.actions.joinGameFailure(errorMessageFromAjax(error))))
        )
    )
  );

const startGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(slice.actions.startGameRequest.match),
    mergeMap((action) =>
      ajax
        .post<api.StartGameResponse>('/api/game/start', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.startGameSuccess(response.response)),
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
        .post<api.PlayActionResponse>('/api/game/action', action.payload, { 'Content-Type': 'application/json' })
        .pipe(
          map(response => slice.actions.playActionSuccess(response.response)),
          catchError(error => of(slice.actions.playActionFailure(errorMessageFromAjax(error))))
        )
    })
  );

export const gameStateEpics = combineEpics(
  createGameEpic,
  joinGameEpic,
  startGameEpic,
  getGameEpic,
  playActionEpic,
);
