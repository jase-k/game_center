// src/pages/api/update-game.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { gameId, fen, currentPlayer, move } = req.body

    try {
      const updatedGame = await prisma.$transaction(async (prisma) => {
        const game = await prisma.gameState.update({
          where: { id: gameId },
          data: {
            fen,
            currentPlayer,
          },
        })

        if (move) {
          const movingPiece = await prisma.gamePiece.findFirst({
            where: { gameId, position: move.from },
            include: { piece: true },
          })

          let capturedPiece = null
          if (move.captured) {
            capturedPiece = await prisma.gamePiece.findFirst({
              where: { gameId, position: move.to },
            })
            if (capturedPiece) {
              const captureOrder = await prisma.gamePiece.count({
                where: { gameId, position: null }
              }) + 1
              
              await prisma.gamePiece.update({
                where: { id: capturedPiece.id },
                data: { 
                  position: null,
                  captureOrder: captureOrder
                },
              })
            }
          }

          if (movingPiece) {
            await prisma.gamePiece.update({
              where: { id: movingPiece.id },
              data: { position: move.to },
            })

            let promotionPieceId = null
            if (move.promotion) {
              const promotedPiece = await prisma.piece.findUnique({ where: { type: move.promotion } })
              if (promotedPiece) {
                await prisma.gamePiece.update({
                  where: { id: movingPiece.id },
                  data: { pieceId: promotedPiece.id },
                })
                promotionPieceId = promotedPiece.id
              }
            }

            await prisma.moveHistory.create({
              data: {
                gameId,
                fromSquare: move.from,
                toSquare: move.to,
                movingPieceId: movingPiece.id,
                capturedPieceId: capturedPiece?.id,
                promotionPieceId,
                check: move.san.includes('+'),
                checkmate: move.san.includes('#'),
                san: move.san,
                moveNumber: (await prisma.moveHistory.count({ where: { gameId } })) + 1,
              },
            })
          }
        }

        return prisma.gameState.findUnique({
          where: { id: gameId },
          include: {
            moveHistory: {
              include: {
                movingPiece: { include: { piece: true } },
                capturedPiece: { include: { piece: true } },
              },
              orderBy: { moveNumber: 'asc' },
            },
            pieces: { 
              include: { piece: true },
              orderBy: [
                { position: 'asc' },
                { captureOrder: 'asc' },
              ],
            },
          },
        })
      })

      res.status(200).json(updatedGame)
    } catch (error) {
      console.error('Error updating game:', error)
      res.status(500).json({ error: 'Failed to update game' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}