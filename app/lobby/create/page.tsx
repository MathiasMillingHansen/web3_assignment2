"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { createGameRequest } from "@/src/store/slices/gameSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function CreateGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [playerName, setPlayerName] = useState("");
    const { gameId, isLoading, error } = useAppSelector((state) => state.game);

    useEffect(() => {
        if (gameId) {
            // Redirect to game page when game is created
            router.push(`/game?id=${gameId}`);
        }
    }, [gameId, router]);

    const handleCreateGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            dispatch(createGameRequest());
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
                    disabled={isLoading}
                    required
                />
                
                <button 
                    type="submit"
                    className={styles.button}
                    disabled={isLoading || !playerName.trim()}
                >
                    {isLoading ? 'Creating...' : 'Create Game'}
                </button>
            </form>

            {error && <p className={styles.error}>Error: {error}</p>}
            
            <Link href="/lobby">
                <button className={styles.backButton}>Back to Lobby</button>
            </Link>
        </div>
    );
}
