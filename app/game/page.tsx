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
  drawCardRequest,
  challengeUnoRequest
} from '@/src/store/slices/gameStateSlice';
import { Color } from '@/src/model/card';
import { useState } from 'react';
import styles from './page.module.css';

export default function GamePage() {
  const gameState = useAppSelector(state => state.gameState.currentGame);
  const isLoading = useAppSelector(state => state.gameState.isLoading);
  const error = useAppSelector(state => state.gameState.error);
  const dispatch = useAppDispatch();

  const [wildCardIndex, setWildCardIndex] = useState<number | null>(null);

  if (!gameState) {
    return (
      <div className={styles.game_container}>
        <div className={styles.game_over}>
          <h1>No active game</h1>
          <p>Join or create a game from the lobby</p>
        </div>
      </div>
    );
  }

  if (hasGameEnded(gameState)) {
    const iWon = gameState.winner === gameState.myPlayerIndex;
    return (
      <div className={styles.game_container}>
        <div className={styles.game_over}>
          <div className={styles.winner_message}>
            {iWon ? '🎉 You Won! 🎉' : 'Game Over'}
          </div>
          <h2>Winner: {gameState.players[gameState.winner!]}</h2>
          <div style={{ marginTop: '2rem' }}>
            <h3>Final Scores:</h3>
            {gameState.players.map((player, index) => (
              <div key={index}>
                {player}: {gameState.scores[index]} points
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const myTurn = gameState.currentPlayerIndex === gameState.myPlayerIndex;
  const currentPlayer = getCurrentPlayerName(gameState);

  const handlePlayCard = (cardIndex: number) => {
    if (!myTurn) return;

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
    if (!myTurn) return;
    dispatch(drawCardRequest());
  };

  const handleChallengeUno = (playerIndex: number) => {
    // Don't challenge yourself
    if (playerIndex === gameState.myPlayerIndex) return;

    // Check if player has 1 card (potential UNO situation)
    if (gameState.handSizes[playerIndex] === 1) {
      const confirmed = confirm(
        `Challenge ${gameState.players[playerIndex]} for not saying UNO?`
      );
      if (confirmed) {
        dispatch(challengeUnoRequest({ targetPlayerIndex: playerIndex }));
      }
    }
  };

  return (
    <div className={styles.game_container}>
      {error && (
        <div className={styles.error_message}>
          {error}
        </div>
      )}

      <div className={styles.game_board}>
        {/* Left Section - Players List */}
        <div className={styles.players_section}>
          <h3>Players</h3>
          {gameState.players.map((player, index) => (
            <div
              key={index}
              className={`${styles.player_card} ${
                gameState.currentPlayerIndex === index ? styles.current_turn : ''
              }`}
              onClick={() => handleChallengeUno(index)}
              title={index !== gameState.myPlayerIndex ? "Click to challenge UNO" : ""}
            >
              <div className={styles.player_name}>
                {player} {index === gameState.myPlayerIndex && '(You)'}
              </div>
              <div className={styles.player_cards}>
                {gameState.handSizes[index]} card{gameState.handSizes[index] !== 1 ? 's' : ''}
                {gameState.handSizes[index] === 1 && ' 🔔'}
              </div>
            </div>
          ))}
        </div>

        {/* Center Section - Game Area */}
        <div className={styles.center_section}>
          {/* Top Card */}
          <div className={styles.discard_pile}>
            <h3>Discard Pile</h3>
            <div
              className={styles.top_card}
              style={{ backgroundColor: getCardColor(gameState.topCard) }}
            >
              {getCardDisplay(gameState.topCard)}
            </div>
            {gameState.currentColor && (
              <p style={{ marginTop: '1rem' }}>
                Current Color: <strong>{gameState.currentColor}</strong>
              </p>
            )}
          </div>

          {/* Draw Pile */}
          <div className={styles.draw_pile_section}>
            <h3>Draw Pile ({gameState.drawPileSize} cards)</h3>
            <button
              onClick={handleDrawCard}
              disabled={!myTurn || isLoading}
              className={styles.draw_button}
            >
              {isLoading ? 'Drawing...' : 'Draw Card'}
            </button>
          </div>

          {/* Your Hand */}
          <div className={styles.my_hand}>
            <h3>Your Hand ({gameState.myHand.length} cards)</h3>
            <div className={styles.cards_container}>
              {gameState.myHand.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handlePlayCard(index)}
                  className={`${styles.card} ${myTurn ? styles.playable : ''}`}
                  style={{ backgroundColor: getCardColor(card) }}
                >
                  {getCardDisplay(card)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Game Info */}
        <div className={styles.info_section}>
          <h3>Game Info</h3>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Current Turn:</strong></p>
            <p>{currentPlayer} {myTurn && '(You)'}</p>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Direction:</strong></p>
            <p style={{ fontSize: '2rem' }}>
              {gameState.direction === 1 ? '→' : '←'}
            </p>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Scores:</strong></p>
            {gameState.players.map((player, index) => (
              <div key={index} style={{ marginTop: '0.5rem' }}>
                {player}: {gameState.scores[index]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {wildCardIndex !== null && (
        <div className={styles.color_picker_overlay}>
          <div className={styles.color_picker}>
            <h3>Choose a Color:</h3>
            <div className={styles.color_buttons}>
              {(['RED', 'YELLOW', 'GREEN', 'BLUE'] as Color[]).map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={styles.color_button}
                  style={{ backgroundColor: color.toLowerCase() }}
                >
                  {color}
                </button>
              ))}
            </div>
            <button
              onClick={() => setWildCardIndex(null)}
              className={styles.cancel_button}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
