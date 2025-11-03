type NumberedCard = Readonly<{
    type: 'NUMBERED'
    color: Color
    number: number
}>

type SkipCard = Readonly<{
    type: 'SKIP'
    color: Color
}>

type ReverseCard = Readonly<{
    type: 'REVERSE'
    color: Color
}>

type DrawCard = Readonly<{
    type: 'DRAW'
    color: Color
}>

type WildCard = Readonly<{
    type: 'WILD'
}>

type WildDrawCard = Readonly<{
    type: 'WILD DRAW'
}>

type ColouredCard = NumberedCard | SkipCard | ReverseCard | DrawCard;

type WildCards = WildCard | WildDrawCard;

type Type = Card['type'];

type Card = NumberedCard | SkipCard | ReverseCard | DrawCard | WildCard | WildDrawCard

const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'] as const

type Color = (typeof colors)[number]

type TypedCard<T extends Type> = Extract<Card, { type: T }>;

function isColor(value: string): value is Color {
  return colors.includes(value as Color);
}

export { type Card, type Color, colors, type NumberedCard, type SkipCard, type ReverseCard, type DrawCard, type WildCard, type WildDrawCard, type ColouredCard, type WildCards, type Type, type TypedCard, isColor }
