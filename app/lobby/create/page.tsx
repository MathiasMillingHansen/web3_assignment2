"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import * as slice from "@/src/store/slices/gameStateSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function CreateGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [playerName, setPlayerName] = useState("");
    const state = useAppSelector((state) => state.gameState);

    useEffect(() => {
        if (state.currentGame) {
            router.push(`/game?gameId=${state.currentGame.gameId}&playerIndex=0`); // Redirect to game page when game is created
        }
    }, [state.currentGame, router]);

    const handleCreateGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            dispatch(slice.actions.createGameRequest({ playerName }));
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create a New Game</h1>

            <form onSubmit={handleCreateGame} className={styles.form}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={styles.input}
                    disabled={state.isLoading}
                    required
                />

                <button
                    type="submit"
                    className={styles.button}
                    disabled={state.isLoading || !playerName.trim()}
                >
                    {state.isLoading ? 'Creating...' : 'Create Game'}
                </button>
            </form>

            {state.error && <p className={styles.error}>Error: {state.error}</p>}

            <Link href="/lobby">
                <button className={styles.backButton}>Back to Lobby</button>
            </Link>
        </div>
    );
}
