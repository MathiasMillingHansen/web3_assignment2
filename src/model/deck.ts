import { type Card } from './card'
import { colors } from './card'
import * as _ from 'lodash'

export type Deck = ReadonlyArray<Card>;
export type { Card } from './card';

//Fill out the empty functions
export function createInitialDeck(): Deck
{
    let numbers = Array.from({ length: 9 }, (_, i) => i + 1); // Create array with items 1..9

    let cards: Card[] = colors.flatMap(color => [
        { type: 'NUMBERED', color, number: 0 },

        ...numbers.flatMap(number => [
            { type: 'NUMBERED' as const, color, number },
            { type: 'NUMBERED' as const, color, number }
        ]),

        { type: 'SKIP', color },
        { type: 'SKIP', color },
        { type: 'REVERSE', color },
        { type: 'REVERSE', color },
        { type: 'DRAW', color },
        { type: 'DRAW', color },

        { type: 'WILD' },
        { type: 'WILD DRAW' },
    ]);

    return cards;
}
