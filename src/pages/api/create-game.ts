// pages/api/create-game.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Chess } from 'chess.js'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newGame = new Chess()

    const gameState = await prisma.gameState.create({
      data: {
        fen: newGame.fen(),
        currentPlayer: 'w',
        capturedPieces: { w: [], b: [] },
      },
    })

    res.status(200).json({ gameId: gameState.id })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}