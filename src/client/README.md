# Client-Side Game Logic

This folder contains **pure functions** for client-side UNO game state management.

## Philosophy

The client **does NOT** implement the full game logic. Instead:

1. **Server is the source of truth** - Server handles all game rules, validation, and state updates
2. **Client receives state** - Server sends game state as JSON objects
3. **Client applies pure functions** - Transform and display the state
4. **Client sends actions** - User interactions are sent to server for validation

## Files

### `gameState.ts`
Pure functions for working with game state received from the server:

```typescript
// Check if a card can be played
canPlayCard(card, gameState) -> boolean

// Get playable cards
getPlayableCards(gameState) -> Card[]

// Optimistic updates (before server confirms)
playCardOptimistic(cardIndex, color, gameState) -> GameState
drawCardOptimistic(gameState) -> GameState

// UI helpers
sortHand(hand) -> Card[]
getCardDisplay(card) -> string
getCurrentPlayerName(gameState) -> string
```

### `gameActions.ts`
Action creators for sending to the server:

```typescript
playCard(cardIndex, chosenColor?) -> GameAction
drawCard() -> GameAction
sayUno() -> GameAction
challengeUno(targetPlayer) -> GameAction
```

## Example Usage

### In a React Component

```typescript
"use client";
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { canPlayCard, isMyTurn, sortHand } from '@/src/client/gameState';
import { playCard, drawCard } from '@/src/client/gameActions';

function GameBoard() {
  const gameState = useAppSelector(state => state.game.currentGame);
  const dispatch = useAppDispatch();
  
  if (!gameState) return <div>Loading...</div>;
  
  // Pure function calls
  const myTurn = isMyTurn(gameState);
  const sortedHand = sortHand(gameState.myHand);
  
  const handlePlayCard = (cardIndex: number) => {
    const card = gameState.myHand[cardIndex];
    
    // Check with pure function
    if (!canPlayCard(card, gameState)) {
      alert("Can't play that card!");
      return;
    }
    
    // Create action and send to server via Redux/Epic
    const action = playCard(cardIndex);
    dispatch(playCardRequest(action));
  };
  
  return (
    <div>
      {myTurn && <button onClick={() => dispatch(drawCardRequest())}>Draw Card</button>}
      {sortedHand.map((card, index) => (
        <Card 
          key={index} 
          card={card}
          playable={canPlayCard(card, gameState)}
          onClick={() => handlePlayCard(index)}
        />
      ))}
    </div>
  );
}
```

### In Redux Epic (RxJS)

```typescript
const playCardEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(playCardRequest.match),
    mergeMap((action) => {
      const gameState = state$.value.game.currentGame;
      
      // Optimistic update
      const optimisticState = playCardOptimistic(
        action.payload.cardIndex,
        action.payload.color,
        gameState
      );
      
      return concat(
        // Update UI immediately
        of(updateGameStateOptimistic(optimisticState)),
        
        // Send to server
        from(api.playCard(action.payload)).pipe(
          map(response => playCardSuccess(response)),
          catchError(error => of(playCardFailure(error)))
        )
      );
    })
  );
```

## Key Principles

✅ **Pure Functions** - No side effects, same input = same output
✅ **Immutable** - Always return new objects, never mutate
✅ **Optimistic Updates** - Update UI immediately, rollback on error
✅ **Server Authority** - Server validates all moves and sends authoritative state
✅ **Type Safe** - Use TypeScript types from `src/model/card.ts`

## What the Server Handles

- Game rule validation
- Card dealing and shuffling
- Turn management
- Score calculation
- Win conditions
- Multi-player synchronization
- Persistence

## What the Client Handles

- Display logic
- Optimistic UI updates
- Card sorting and organization
- Visual feedback
- Input validation (before sending to server)
- Animations and transitions
