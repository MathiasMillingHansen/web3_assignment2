import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  createGameRequest,
  createGameSuccess,
  createGameFailure,
  joinGameRequest,
  joinGameSuccess,
  joinGameFailure,
} from '../slices/gameSlice';

// Epic for creating a game
const createGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(createGameRequest.match),
    delay(1000), // Simulate API call
    map(() => {
      // Generate a random game ID
      const gameId = Math.random().toString(36).substring(7);
      return createGameSuccess(gameId);
    }),
    catchError((error) => of(createGameFailure(error.message)))
  );

// Epic for joining a game
const joinGameEpic: Epic = (action$) =>
  action$.pipe(
    filter(joinGameRequest.match),
    delay(1000), // Simulate API call
    map((action) => {
      // Simulate successful join
      return joinGameSuccess({
        gameId: action.payload,
        players: ['Player 1', 'Player 2'],
      });
    }),
    catchError((error) => of(joinGameFailure(error.message)))
  );

export const gameEpics = combineEpics(
  createGameEpic,
  joinGameEpic
);
