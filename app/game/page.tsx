"use client";

import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import {
  getCardDisplay,
  getCardColor,
  getCurrentPlayerName,
} from '@/src/client/gameState';
import * as slice from '@/src/store/slices/gameStateSlice';
import { Color } from '@/src/model/card';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { challengeUnoAction, drawCardAction, playCardAction, sayUnoAction } from '@/src/shared/api';

function GamePageContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') ?? '';
  const playerIndex = parseInt(searchParams.get('playerIndex') ?? '0');
  const gameState = useAppSelector(state => state.gameState.currentGame);
  const isLoading = useAppSelector(state => state.gameState.isLoading);
  const error = useAppSelector(state => state.gameState.error);
  const dispatch = useAppDispatch();

  console.log('playerIndex', playerIndex);
  console.log('game', gameState);

  const [wildCardIndex, setWildCardIndex] = useState<number | null>(null);
  const [saidUno, setSaidUno] = useState(false);

  useEffect(() => {
    // Subscribe to game updates via SSE
    dispatch(slice.actions.subscribeToGameRequest({ gameId, playerIndex }));
    
    // Cleanup: unsubscribe when component unmounts
    return () => {
      dispatch(slice.actions.unsubscribeFromGame());
    };
  }, [dispatch, gameId, playerIndex]);

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

  if (gameState.status == 'PRE-GAME') {
    return (
      <div className={styles.game_container}>
        {error && (
          <div className={styles.error_message}>
            {error}
          </div>
        )}
        <div className={styles.game_over}>
          <h1>Waiting for players...</h1>
          <p>Current Players:</p>
          <ul>
            {gameState.players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
          <div>
            {playerIndex === 0 && (
              <button className={styles.simple_button} onClick={() => dispatch(slice.actions.startGameRequest({ gameId, playerIndex }))}>Start game</button>
            )}
          </div>
          <div>Game code: </div>
          <div>{gameId}</div>
        </div>
      </div>
    );
  }

  if (gameState.status == 'POST-GAME') {
    let roundState = gameState.round!;
    const iWon = roundState.winner === playerIndex;
    return (
      <div className={styles.game_container}>
        {error && (
          <div className={styles.error_message}>
            {error}
          </div>
        )}
        <div className={styles.game_over}>
          <div className={styles.winner_message}>
            {iWon ? '🎉 You Won! 🎉' : 'Game Over'}
          </div>
          <h2>Winner: {gameState.players[roundState.winner!]}</h2>
          <div style={{ marginTop: '2rem' }}>
            <h3>Scores:</h3>
            {gameState.players.map((player, index) => (
              <div key={index} style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
                {player}: {gameState.scores[index]} points
              </div>
            ))}
          </div>
          {playerIndex === 0 && (
            <button
              onClick={() => dispatch(slice.actions.startGameRequest({ gameId, playerIndex }))}
              disabled={isLoading}
              className={styles.simple_button}
              style={{ marginTop: '2rem' }}
            >
              {isLoading ? 'Starting...' : 'Start New Round'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState.status == 'IN-GAME') {

    let roundState = gameState.round!;
    const myTurn = roundState.currentPlayerIndex === playerIndex;
    const currentPlayer = getCurrentPlayerName(gameState);

    const handlePlayCard = (cardIndex: number) => {
      if (!myTurn) return;

      const card = roundState.myHand[cardIndex];

      // Wild cards need color selection
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        setWildCardIndex(cardIndex);
        return;
      }

      // Send action to server
      dispatch(slice.actions.playActionRequest({ gameId, playerIndex, action: playCardAction(cardIndex) }));
      
      // Reset UNO flag after playing
      setSaidUno(false);
    };

    const handleColorSelect = (color: Color) => {
      if (wildCardIndex !== null) {
        dispatch(slice.actions.playActionRequest({ gameId, playerIndex, action: playCardAction(wildCardIndex, color) }));
        setWildCardIndex(null);
        // Reset UNO flag after playing
        setSaidUno(false);
      }
    };

    const handleDrawCard = () => {
      if (!myTurn) return;
      dispatch(slice.actions.playActionRequest({ gameId, playerIndex, action: drawCardAction() }));
      // Reset UNO flag when drawing
      setSaidUno(false);
    };
    
    const handleSayUno = () => {
      if (!myTurn) return;
      // Send SAY_UNO action immediately
      dispatch(slice.actions.playActionRequest({ gameId, playerIndex, action: sayUnoAction() }));
      setSaidUno(true);
    };

    const handleChallengeUno = (targetIndex: number) => {
      // Don't challenge yourself
      if (targetIndex === playerIndex) return;

      // Check if player has 1 card (potential UNO situation)
      if (roundState.handSizes[targetIndex] === 1) {
        const confirmed = confirm(
          `Challenge ${gameState.players[targetIndex]} for not saying UNO?`
        );
        if (confirmed) {
          dispatch(slice.actions.playActionRequest({ gameId, playerIndex, action: challengeUnoAction(targetIndex) }));
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
                className={`${styles.player_card} ${roundState.currentPlayerIndex === index ? styles.current_turn : ''
                  } ${roundState.handSizes[index] === 1 && index !== playerIndex ? styles.uno_challengeable : ''}`}
                onClick={() => handleChallengeUno(index)}
                title={index !== playerIndex && roundState.handSizes[index] === 1 ? "Click to challenge UNO!" : ""}
                style={{ cursor: index !== playerIndex && roundState.handSizes[index] === 1 ? 'pointer' : 'default' }}
              >
                <div className={styles.player_name}>
                  {player} {index === playerIndex && '(You)'}
                </div>
                <div className={styles.player_cards}>
                  {roundState.handSizes[index]} card{roundState.handSizes[index] !== 1 ? 's' : ''}
                  {roundState.handSizes[index] === 1 && ' 🔔'}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.7 }}>
                  Score: {gameState.scores[index]} pts
                </div>
              </div>
            ))}
          </div>

          {/* Center Section - Game Area */}
          <div className={styles.center_section}>
            {/* Top Card */}
            {roundState.topCard && (
              <div className={styles.discard_pile}>
                <h3>Discard Pile</h3>
                <div
                  className={styles.top_card}
                  style={{ backgroundColor: roundState.currentColor.toLowerCase() }}
                >
                  {getCardDisplay(roundState.topCard)}
                </div>
                <p style={{ marginTop: '1rem' }}>
                  Current Color: <strong>{roundState.currentColor}</strong>
                </p>
              </div>
            )}

            {/* Draw Pile */}
            <div className={styles.draw_pile_section}>
              <button
                onClick={handleDrawCard}
                disabled={!myTurn || isLoading}
                className={styles.draw_button}
              >
                {isLoading ? 'Drawing...' : 'Draw Card'}
              </button>
              
              {/* Say UNO Button - show when player has 2 cards */}
              {roundState.myHand.length === 2 && (
                <button
                  onClick={handleSayUno}
                  disabled={!myTurn || isLoading || saidUno}
                  className={`${styles.uno_button} ${saidUno ? styles.uno_said : ''}`}
                >
                  {saidUno ? '✓ UNO!' : 'Say UNO!'}
                </button>
              )}
            </div>

            {/* Your Hand */}
            <div className={styles.my_hand}>
              <h3>Your Hand ({roundState.myHand.length} cards)</h3>
              <div className={styles.cards_container}>
                {roundState.myHand.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => handlePlayCard(index)}
                    className={`${styles.card} ${myTurn ? styles.playable : ''} ${
                      card.type === 'WILD' || card.type === 'WILD DRAW' ? styles.card_wild : ''
                    }`}
                    style={card.type === 'WILD' || card.type === 'WILD DRAW' ? {} : { backgroundColor: getCardColor(card) }}
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
                {roundState.direction === 1 ? '→' : '←'}
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

  return <div>Unknown game state: {gameState.status}</div>;
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
