"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { joinGameRequest } from "@/src/store/slices/gameSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function JoinGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [gameCode, setGameCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const { gameId, isLoading, error } = useAppSelector((state) => state.game);

    useEffect(() => {
        if (gameId) {
            // Redirect to game page when joined
            router.push(`/game?id=${gameId}`);
        }
    }, [gameId, router]);

    const handleJoinGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameCode.trim() && playerName.trim()) {
            dispatch(joinGameRequest(gameCode));
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
                    disabled={isLoading}
                    required
                />
                
                <input
                    type="text"
                    placeholder="Enter game code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    className={styles.input}
                    disabled={isLoading}
                    required
                />
                
                <button 
                    type="submit" 
                    className={styles.button}
                    disabled={isLoading || !gameCode.trim() || !playerName.trim()}
                >
                    {isLoading ? 'Joining...' : 'Join Game'}
                </button>
            </form>

            {error && <p className={styles.error}>Error: {error}</p>}
            
            <Link href="/lobby">
                <button className={styles.backButton}>Back to Lobby</button>
            </Link>
        </div>
    );
}
