import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.homeButton}>
          🏠 Home
        </Link>
      </div>
    </header>
  );
}
