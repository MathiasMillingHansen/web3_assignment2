# Redux + RxJS Setup

## Installation

First, install the required dependencies:

```bash
npm install @reduxjs/toolkit react-redux rxjs redux-observable
```

## Structure

```
src/store/
├── store.ts              # Redux store configuration
├── hooks.ts              # Typed Redux hooks
├── StoreProvider.tsx     # Provider component for Next.js
├── slices/
│   └── gameSlice.ts      # Game state slice
└── epics/
    ├── index.ts          # Root epic combiner
    └── gameEpics.ts      # Game-related epics (RxJS side effects)
```

## What's Set Up

### Redux Toolkit
- **Store**: Configured in `src/store/store.ts`
- **Slice**: Game state management in `src/store/slices/gameSlice.ts`
- **Typed Hooks**: `useAppDispatch` and `useAppSelector` for type safety

### RxJS + Redux-Observable
- **Epics**: Handle async side effects using RxJS operators
- **gameEpics.ts**: Examples of creating and joining games with simulated API calls

### Integration with Next.js
- **StoreProvider**: Wraps the app in `app/layout.tsx`
- **Client Components**: Lobby pages use `"use client"` directive

## Usage Examples

### Dispatch Actions
```tsx
import { useAppDispatch } from "@/store/hooks";
import { createGameRequest } from "@/store/slices/gameSlice";

const dispatch = useAppDispatch();
dispatch(createGameRequest());
```

### Select State
```tsx
import { useAppSelector } from "@/store/hooks";

const { gameId, isLoading } = useAppSelector((state) => state.game);
```

### Add New Epics
```tsx
// In gameEpics.ts or new epic file
const myEpic: Epic = (action$) =>
  action$.pipe(
    filter(myAction.match),
    // RxJS operators (map, mergeMap, delay, catchError, etc.)
    map(() => mySuccessAction())
  );
```

## RxJS Operators Used

- `filter()` - Filter actions by type
- `map()` - Transform actions
- `delay()` - Simulate async operations
- `catchError()` - Handle errors
- `of()` - Create observables from values

## Next Steps

1. Replace simulated API calls in epics with real API calls
2. Add more slices for different features (players, cards, etc.)
3. Add more epics for complex async logic
4. Consider adding `redux-persist` for state persistence
