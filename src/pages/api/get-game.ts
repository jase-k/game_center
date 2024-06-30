// pages/api/get-game.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { gameId } = req.query

    if (typeof gameId !== 'string') {
      return res.status(400).json({ error: 'Invalid gameId' })
    }

    const gameState = await prisma.gameState.findUnique({
      where: { id: gameId },
    })

    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' })
    }

    res.status(200).json(gameState)
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}