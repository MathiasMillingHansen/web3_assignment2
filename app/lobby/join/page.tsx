"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import * as slice from "@/src/store/slices/gameStateSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function JoinGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [gameId, setGameId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const state = useAppSelector((state) => state.gameState);

    useEffect(() => {
        if (state.gameId !== undefined && state.playerIndex !== undefined) {
            router.push(`/game?gameId=${state.gameId}&playerIndex=${state.playerIndex}`);
        }
    }, [state.gameId, state.playerIndex, router]);

    const handleJoinGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameId.trim() && playerName.trim()) {
            dispatch(slice.actions.joinGameRequest({ gameId: gameId, playerName }));
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Join an Existing Game</h1>

            <form onSubmit={handleJoinGame} className={styles.form}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={styles.input}
                    disabled={state.isLoading}
                    required
                />

                <input
                    type="text"
                    placeholder="Enter game code"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className={styles.input}
                    disabled={state.isLoading}
                    required
                />

                <button
                    type="submit"
                    className={styles.button}
                    disabled={state.isLoading || !gameId.trim() || !playerName.trim()}
                >
                    {state.isLoading ? 'Joining...' : 'Join Game'}
                </button>
            </form>

            {state.error && <p className={styles.error}>Error: {state.error}</p>}

            <Link href="/lobby">
                <button className={styles.backButton}>Back to Lobby</button>
            </Link>
        </div>
    );
}
