// pages/index.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const [joinGameId, setJoinGameId] = useState('');
  const [error, setError] = useState('');

  const createGame = async () => {
    try {
      const response = await fetch('/api/create-game', { method: 'POST' });
      const data = await response.json();
      if (data.gameId) {
        router.push(`/game/${data.gameId}`);
      } else {
        setError('Failed to create game. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const joinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinGameId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    try {
      const response = await fetch(`/api/get-game?gameId=${joinGameId}`);
      const data = await response.json();
      if (data.error) {
        setError('Game not found. Please check the ID and try again.');
      } else {
        router.push(`/game/${joinGameId}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fog of War Chess</h1>
      
      <div className={styles.buttonContainer}>
        <button onClick={createGame} className={styles.button}>
          Create New Game
        </button>
      </div>

      <form onSubmit={joinGame} className={styles.form}>
        <input
          type="text"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
          placeholder="Enter Game ID"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Join Game
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}