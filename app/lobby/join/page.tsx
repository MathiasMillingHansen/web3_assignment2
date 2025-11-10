"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { joinGameRequest } from "@/src/store/slices/gameSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function JoinGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [gameCode, setGameCode] = useState("");
    const { gameId, isLoading, error } = useAppSelector((state) => state.game);

    useEffect(() => {
        if (gameId) {
            // Redirect to game page when joined
            router.push(`/game?id=${gameId}`);
        }
    }, [gameId, router]);

    const handleJoinGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameCode.trim()) {
            dispatch(joinGameRequest(gameCode));
        }
    };

    return (
        <div>
            <h1>Join an Existing Game</h1>
            
            <form onSubmit={handleJoinGame}>
                <input
                    type="text"
                    placeholder="Enter game code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !gameCode.trim()}>
                    {isLoading ? 'Joining...' : 'Join Game'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            <Link href="/lobby">
                <button>Back to Lobby</button>
            </Link>
        </div>
    );
}
