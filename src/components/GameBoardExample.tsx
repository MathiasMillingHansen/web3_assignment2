"use client";

import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { 
  getCardDisplay,
  getCardColor,
  getCurrentPlayerName,
  hasGameEnded
} from '@/src/client/gameState';
import { 
  playCardRequest, 
  drawCardRequest 
} from '@/src/store/slices/gameStateSlice';
import { Color } from '@/src/model/card';
import { useState } from 'react';

export default function GameBoardExample() {
  const gameState = useAppSelector(state => state.gameState.currentGame);
  const isLoading = useAppSelector(state => state.gameState.isLoading);
  const error = useAppSelector(state => state.gameState.error);
  const dispatch = useAppDispatch();
  
  const [wildCardIndex, setWildCardIndex] = useState<number | null>(null);

  if (!gameState) {
    return <div>No active game. Join or create a game first.</div>;
  }

  if (hasGameEnded(gameState)) {
    const iWon = gameState.winner === gameState.myPlayerIndex;
    return (
      <div>
        <h1>{iWon ? 'You Won! 🎉' : 'Game Over'}</h1>
        <p>Winner: {gameState.players[gameState.winner!]}</p>
      </div>
    );
  }

  const myTurn = gameState.currentPlayerIndex === gameState.myPlayerIndex;
  const currentPlayer = getCurrentPlayerName(gameState);

  const handlePlayCard = (cardIndex: number) => {
    const card = gameState.myHand[cardIndex];

    // Wild cards need color selection
    if (card.type === 'WILD' || card.type === 'WILD DRAW') {
      setWildCardIndex(cardIndex);
      return;
    }

    // Send action to server
    dispatch(playCardRequest({ cardIndex }));
  };

  const handleColorSelect = (color: Color) => {
    if (wildCardIndex !== null) {
      dispatch(playCardRequest({ 
        cardIndex: wildCardIndex, 
        chosenColor: color 
      }));
      setWildCardIndex(null);
    }
  };

  const handleDrawCard = () => {
    dispatch(drawCardRequest());
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>UNO Game</h1>

      {/* Game Status */}
      <div style={{ marginBottom: '2rem' }}>
        <p><strong>Current Player:</strong> {currentPlayer} {myTurn && "(You)"}</p>
        <p><strong>Direction:</strong> {gameState.direction === 1 ? '→' : '←'}</p>
        <p><strong>Draw Pile:</strong> {gameState.drawPileSize} cards</p>
        {gameState.currentColor && (
          <p><strong>Current Color:</strong> {gameState.currentColor}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {/* Top Card */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Top Card:</h3>
        <div 
          style={{
            padding: '2rem',
            backgroundColor: getCardColor(gameState.topCard),
            color: 'white',
            borderRadius: '8px',
            display: 'inline-block',
            minWidth: '150px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}
        >
          {getCardDisplay(gameState.topCard)}
        </div>
      </div>

      {/* Other Players */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Other Players:</h3>
        {gameState.players.map((player, index) => {
          if (index === gameState.myPlayerIndex) return null;
          return (
            <div key={index}>
              {player}: {gameState.handSizes[index]} cards
              {gameState.currentPlayerIndex === index && " (Current Turn)"}
            </div>
          );
        })}
      </div>

      {/* Draw Button */}
      {myTurn && (
        <button 
          onClick={handleDrawCard}
          disabled={isLoading}
          style={{
            padding: '1rem 2rem',
            marginBottom: '2rem',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Drawing...' : 'Draw Card'}
        </button>
      )}

      {/* Your Hand */}
      <div>
        <h3>Your Hand ({gameState.myHand.length} cards):</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {gameState.myHand.map((card, index) => (
            <div
              key={index}
              onClick={() => myTurn && handlePlayCard(index)}
              style={{
                padding: '1.5rem 1rem',
                backgroundColor: getCardColor(card),
                color: 'white',
                borderRadius: '8px',
                cursor: myTurn ? 'pointer' : 'not-allowed',
                opacity: myTurn ? 1 : 0.5,
                border: myTurn ? '3px solid yellow' : 'none',
                minWidth: '100px',
                textAlign: 'center',
                fontWeight: 'bold',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                if (myTurn) e.currentTarget.style.transform = 'translateY(-10px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {getCardDisplay(card)}
            </div>
          ))}
        </div>
      </div>

      {/* Color Picker Modal */}
      {wildCardIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
          }}>
            <h3>Choose a Color:</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {(['RED', 'YELLOW', 'GREEN', 'BLUE'] as Color[]).map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    padding: '2rem',
                    backgroundColor: color.toLowerCase(),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
            <button
              onClick={() => setWildCardIndex(null)}
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Score Display */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Scores:</h3>
        {gameState.players.map((player, index) => (
          <div key={index}>
            {player}: {gameState.scores[index]} points
          </div>
        ))}
      </div>
    </div>
  );
}
