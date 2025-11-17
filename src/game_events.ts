// Simple in-memory pub-sub system for game state updates
// This will notify all subscribers when a game state changes

type GameUpdateListener = (gameId: string) => void;

class GameEventEmitter {
  private listeners: Map<string, Set<GameUpdateListener>> = new Map();

  constructor() {
    console.log('[GameEventEmitter] New instance created');
  }

  subscribe(gameId: string, listener: GameUpdateListener): () => void {
    if (!this.listeners.has(gameId)) {
      this.listeners.set(gameId, new Set());
    }
    this.listeners.get(gameId)!.add(listener);
    console.log(`[GameEvents] Subscribed to game ${gameId}. Total subscribers: ${this.listeners.get(gameId)!.size}`);

    // Return unsubscribe function
    return () => {
      const gameListeners = this.listeners.get(gameId);
      if (gameListeners) {
        gameListeners.delete(listener);
        console.log(`[GameEvents] Unsubscribed from game ${gameId}. Remaining subscribers: ${gameListeners.size}`);
        if (gameListeners.size === 0) {
          this.listeners.delete(gameId);
        }
      }
    };
  }

  emit(gameId: string): void {
    const gameListeners = this.listeners.get(gameId);
    console.log(`[GameEvents] Emitting event for game ${gameId}. Subscribers: ${gameListeners?.size ?? 0}`);
    if (gameListeners) {
      gameListeners.forEach(listener => listener(gameId));
    }
  }
}

// Use globalThis to ensure singleton across module reloads in development
const globalForGameEvents = globalThis as unknown as {
  gameEvents: GameEventEmitter | undefined;
};

export const gameEvents = globalForGameEvents.gameEvents ?? new GameEventEmitter();
globalForGameEvents.gameEvents = gameEvents;
