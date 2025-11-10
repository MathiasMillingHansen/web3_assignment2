import { combineEpics } from 'redux-observable';
import { gameEpics } from './gameEpics';

export const rootEpic = combineEpics(
  gameEpics
);
