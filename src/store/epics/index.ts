import { combineEpics } from 'redux-observable';
import { gameStateEpics } from './gameStateEpics';

export const rootEpic = combineEpics(
  gameStateEpics
);
