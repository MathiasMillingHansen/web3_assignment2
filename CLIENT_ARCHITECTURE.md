# Client-Side UNO Game Logic - Pure Functions Approach

## Overview

This implementation follows a **client-server architecture** where:

- **Server**: Authoritative game logic, validation, and state management
- **Client**: Pure functions for UI state transformations and optimistic updates

## Architecture

```
User Action → Redux Action → Epic (RxJS) → Server API
                ↓                              ↓
         Optimistic Update              Server Response
                ↓                              ↓
           UI Updates ←────── Final State ─────┘
```

## File Structure

```
src/
├── client/                    # Pure client-side functions
│   ├── gameState.ts          # State transformation functions
│   ├── gameActions.ts        # Action creators
│   └── README.md             # Documentation
│
├── store/
│   ├── slices/
│   │   ├── gameSlice.ts      # Lobby/game creation state
│   │   └── gameStateSlice.ts # Active game state
│   └── epics/
│       ├── gameEpics.ts      # Lobby epics
│       └── gameStateEpics.ts # Game play epics
│
└── model/                     # Shared types (used by both client & server)
    └── card.ts               # Card type definitions
```

## Key Concepts

### 1. Pure Functions (src/client/gameState.ts)

All game logic is **pure functions** - no side effects, same input always produces same output:

```typescript
// ✅ Pure - always returns same result for same input
function canPlayCard(card: Card, gameState: GameState): boolean {
  // No API calls, no state mutation, no side effects
  return /* boolean based on card and gameState */
}

// ✅ Pure - returns new object, doesn't mutate
function sortHand(hand: Card[]): Card[] {
  return [...hand].sort(/* ... */);
}
```

### 2. Server Authority

The server is the **source of truth**:

```typescript
// Client sends action
dispatch(playCardRequest({ cardIndex: 2, chosenColor: 'RED' }))

// Server validates and responds with authoritative state
{
  gameId: "abc123",
  currentPlayerIndex: 1,  // Server decides next player
  myHand: [/* ... */],     // Server updates hand
  // ... etc
}
```

### 3. Optimistic Updates

Client immediately updates UI, then server confirms or rejects:

```typescript
const playCardEpic: Epic = (action$, state$) =>
  action$.pipe(
    mergeMap((action) => {
      // 1. Calculate optimistic state (pure function)
      const optimisticState = playCardOptimistic(/* ... */);
      
      return concat(
        // 2. Update UI immediately
        of(updateGameStateOptimistic(optimisticState)),
        
        // 3. Send to server
        from(api.playCard(action)).pipe(
          // 4. Server confirms or rejects
          map(response => playCardSuccess(response)),
          catchError(error => of(playCardFailure(error)))
        )
      );
    })
  );
```

## Usage Examples

### In a React Component

```typescript
"use client";
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { 
  canPlayCard, 
  isMyTurn, 
  sortHand, 
  getPlayableCards 
} from '@/src/client/gameState';
import { playCardRequest, drawCardRequest } from '@/src/store/slices/gameStateSlice';

function GameBoard() {
  const gameState = useAppSelector(state => state.gameState.currentGame);
  const dispatch = useAppDispatch();
  
  if (!gameState) return <div>Loading...</div>;
  
  // All pure function calls
  const myTurn = isMyTurn(gameState);
  const sortedHand = sortHand(gameState.myHand);
  const playableCards = getPlayableCards(gameState);
  
  const handlePlayCard = (cardIndex: number) => {
    const card = gameState.myHand[cardIndex];
    
    if (!myTurn) {
      alert("Not your turn!");
      return;
    }
    
    if (!canPlayCard(card, gameState)) {
      alert("Can't play that card!");
      return;
    }
    
    // For wild cards, ask for color
    if (card.type === 'WILD' || card.type === 'WILD DRAW') {
      const color = prompt("Choose color: RED, YELLOW, GREEN, BLUE");
      dispatch(playCardRequest({ cardIndex, chosenColor: color as Color }));
    } else {
      dispatch(playCardRequest({ cardIndex }));
    }
  };
  
  return (
    <div>
      <h2>Current Player: {getCurrentPlayerName(gameState)}</h2>
      
      {myTurn && (
        <button onClick={() => dispatch(drawCardRequest())}>
          Draw Card
        </button>
      )}
      
      <div className="hand">
        {sortedHand.map((card, index) => (
          <Card
            key={index}
            card={card}
            playable={canPlayCard(card, gameState) && myTurn}
            onClick={() => handlePlayCard(index)}
          />
        ))}
      </div>
      
      <div>Playable cards: {playableCards.length}</div>
    </div>
  );
}
```

### Pure Function Benefits

✅ **Testable**: Easy to unit test without mocking
```typescript
test('canPlayCard - matching color', () => {
  const card = { type: 'NUMBERED', color: 'RED', number: 5 };
  const gameState = {
    topCard: { type: 'NUMBERED', color: 'RED', number: 3 },
    // ...
  };
  expect(canPlayCard(card, gameState)).toBe(true);
});
```

✅ **Predictable**: Same input = same output, always
✅ **No Side Effects**: Doesn't modify arguments or global state
✅ **Composable**: Easy to combine multiple pure functions
✅ **Debuggable**: Clear input/output, easy to trace

## State Flow

### 1. Initial Load
```
Server → GameState → Redux Store → React Component → Pure Functions → UI
```

### 2. User Plays Card
```
User Click → playCardRequest → Epic
                                  ↓
                         playCardOptimistic (pure)
                                  ↓
                         Optimistic UI Update
                                  ↓
                              API Call
                                  ↓
                         Server Response
                                  ↓
                         playCardSuccess
                                  ↓
                           Final UI Update
```

### 3. Server Push Update (Other Player's Turn)
```
WebSocket/Polling → updateGameState → Redux Store → React Re-render
```

## Testing Strategy

### Pure Functions (Easy!)
```typescript
import { canPlayCard, sortHand } from '@/src/client/gameState';

describe('canPlayCard', () => {
  it('allows matching color', () => {
    const result = canPlayCard(mockCard, mockGameState);
    expect(result).toBe(true);
  });
});
```

### Epics (RxJS Marble Testing)
```typescript
import { TestScheduler } from 'rxjs/testing';

it('playCardEpic should dispatch success', () => {
  const testScheduler = new TestScheduler(/* ... */);
  testScheduler.run(({ hot, cold, expectObservable }) => {
    // Test epic behavior
  });
});
```

## API Integration (To Be Implemented)

Replace simulated API calls with real endpoints:

```typescript
// src/api/gameApi.ts
export async function playCard(gameId: string, cardIndex: number, color?: Color) {
  const response = await fetch(`/api/games/${gameId}/play`, {
    method: 'POST',
    body: JSON.stringify({ cardIndex, color }),
  });
  return response.json();
}

// Use in epic
import { playCard as apiPlayCard } from '@/src/api/gameApi';

const playCardEpic: Epic = (action$) =>
  action$.pipe(
    filter(playCardRequest.match),
    mergeMap((action) => 
      from(apiPlayCard(gameId, action.payload.cardIndex, action.payload.chosenColor)).pipe(
        map(response => playCardSuccess(response)),
        catchError(error => of(playCardFailure(error.message)))
      )
    )
  );
```

## Summary

- **Server**: Full game logic, validation, authoritative state
- **Client**: Pure functions for display and optimistic updates
- **No Duplication**: Client doesn't re-implement game rules
- **Clean Separation**: Easy to maintain and test
- **Optimistic UX**: Instant feedback while waiting for server
