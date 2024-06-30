// src/pages/game/[id].tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Chess, Square, Move } from 'chess.js'
import styles from '@/styles/Game.module.css'

type Player = 'w' | 'b'

type MoveHistory = {
  id: number
  fromSquare: string
  toSquare: string
  piece: string
  capture?: string
  promotion?: string
  check: boolean
  checkmate: boolean
  san: string
  moveNumber: number
}
type CapturedPiece = {
  id: number
  piece: string
  color: Player
  captureOrder: number
}

type GameState = {
  id: string
  fen: string
  currentPlayer: Player
  moveHistory: MoveHistory[]
  capturedPieces: CapturedPiece[]
}

export default function Game() {
  const router = useRouter()
  const { id: gameId } = router.query

  const [game, setGame] = useState<Chess>(new Chess())
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)

  useEffect(() => {
    if (typeof gameId !== 'string') return

    const fetchGameState = async () => {
      const response = await fetch(`/api/get-game?gameId=${gameId}`)
      const data = await response.json()
      if (data && !data.error) {
        setGameState(data)
        setGame(new Chess(data.fen))
      }
    }

    fetchGameState()
    const interval = setInterval(fetchGameState, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [gameId])

  useEffect(() => {
    // Assign player color (you might want to implement a more robust player assignment)
    setPlayer(Math.random() < 0.5 ? 'w' : 'b')
  }, [])

  const updateGameState = async (newFen: string, newCurrentPlayer: Player, move: Move | null, capturedPiece: { piece: string, color: Player } | null) => {
    if (typeof gameId !== 'string' || !gameState) return

    const response = await fetch('/api/update-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        fen: newFen,
        currentPlayer: newCurrentPlayer,
        move: move ? {
          from: move.from,
          to: move.to,
          piece: move.piece,
          captured: move.captured,
          promotion: move.promotion,
          check: move.san.includes('+'),
          checkmate: move.san.includes('#'),
          san: move.san
        } : null,
        capturedPiece,
      }),
    })

    const data = await response.json()
    if (!data.error) {
      setGameState(data)
    }
  }

  const handleClick = (row: number, col: number) => {
    if (!gameState || player !== gameState.currentPlayer) return

    const square = `${'abcdefgh'[col]}${8 - row}` as Square
    
    if (selectedSquare) {
      try {
        const move = game.move({ from: selectedSquare, to: square })
        if (move) {
          const capturedPiece = move.captured ? { piece: move.captured, color: player === 'w' ? 'b' : 'w' } : null
          updateGameState(game.fen(), player === 'w' ? 'b' : 'w', move, capturedPiece)
        }
        setSelectedSquare(null)
      } catch (e) {
        setSelectedSquare(square)
      }
    } else {
      setSelectedSquare(square)
    }
  }


  // ... (keep isVisible, getPieceSymbol, renderSquare functions)

  const renderMoveHistory = () => (
    <div className={styles.moveHistory}>
      <h3>Move History</h3>
      <ol>
        {gameState?.moveHistory.map((move) => (
          <li key={move.id}>
            {move.moveNumber}. {move.san}
            {move.check ? '+' : ''}
            {move.checkmate ? '#' : ''}
          </li>
        ))}
      </ol>
    </div>
  )


  const renderCapturedPieces = (color: Player) => (
    <div className={styles.capturedPieces}>
      <h3>{color === 'w' ? 'White' : 'Black'} Captured:</h3>
      {gameState?.capturedPieces
        .filter(piece => piece.color === color)
        .map((piece) => (
          <span key={piece.id} className={styles.capturedPiece}>
            {getPieceSymbol(piece.piece, color === 'w' ? 'b' : 'w')}
          </span>
        ))}
    </div>
  )

  if (!gameState || !player) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fog of War Chess</h1>
      <div className={styles.gameArea}>
        {renderCapturedPieces('b')}
        <div className={styles.board}>
          {game.board().map((row, rowIndex) =>
            row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
          )}
        </div>
        {renderCapturedPieces('w')}
        {renderMoveHistory()}
      </div>
      <p className={styles.status}>
        Current player: {gameState.currentPlayer === 'w' ? 'White' : 'Black'}
        {player === gameState.currentPlayer ? " (Your turn)" : ""}
      </p>
    </div>
  )
}