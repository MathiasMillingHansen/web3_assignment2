import styles from "./page.module.css";
import Link from "next/link";

export default function Lobby() {
    return (
        <div className={styles.lobby_container}>
            <Link href="/lobby/create">
                <button className={styles.lobby_button}>
                    Create game
                </button>
            </Link>

            <Link href="/lobby/join">
                <button className={styles.lobby_button}>
                    Join game
                </button>
            </Link>
        </div>
    );
}