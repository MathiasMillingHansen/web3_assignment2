"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { createGameRequest } from "@/src/store/slices/gameSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateGame() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { gameId, isLoading, error } = useAppSelector((state) => state.game);

    useEffect(() => {
        if (gameId) {
            // Redirect to game page when game is created
            router.push(`/game?id=${gameId}`);
        }
    }, [gameId, router]);

    const handleCreateGame = () => {
        dispatch(createGameRequest());
    };

    return (
        <div>
            <h1>Create a New Game</h1>
            
            <button 
                onClick={handleCreateGame}
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'Create Game'}
            </button>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            <Link href="/lobby">
                <button>Back to Lobby</button>
            </Link>
        </div>
    );
}
