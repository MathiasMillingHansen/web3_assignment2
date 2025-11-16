import { combineEpics } from 'redux-observable';
import { gameEpics } from './gameEpics';
import { gameStateEpics } from './gameStateEpics';

export const rootEpic = combineEpics(
  gameEpics,
  gameStateEpics
);
