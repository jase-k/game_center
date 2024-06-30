/*
  Warnings:

  - You are about to drop the column `capturedPieces` on the `GameState` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameState" DROP COLUMN "capturedPieces";

-- CreateTable
CREATE TABLE "Piece" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePiece" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "pieceId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "position" TEXT,
    "captureOrder" INTEGER,

    CONSTRAINT "GamePiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoveHistory" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "fromSquare" TEXT NOT NULL,
    "toSquare" TEXT NOT NULL,
    "movingPieceId" INTEGER NOT NULL,
    "capturedPieceId" INTEGER,
    "promotionPieceId" INTEGER,
    "check" BOOLEAN NOT NULL DEFAULT false,
    "checkmate" BOOLEAN NOT NULL DEFAULT false,
    "san" TEXT NOT NULL,
    "moveNumber" INTEGER NOT NULL,

    CONSTRAINT "MoveHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Piece_type_key" ON "Piece"("type");

-- CreateIndex
CREATE INDEX "GamePiece_gameId_idx" ON "GamePiece"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePiece_gameId_position_key" ON "GamePiece"("gameId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MoveHistory_gameId_moveNumber_key" ON "MoveHistory"("gameId", "moveNumber");

-- AddForeignKey
ALTER TABLE "GamePiece" ADD CONSTRAINT "GamePiece_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePiece" ADD CONSTRAINT "GamePiece_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveHistory" ADD CONSTRAINT "MoveHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveHistory" ADD CONSTRAINT "MoveHistory_movingPieceId_fkey" FOREIGN KEY ("movingPieceId") REFERENCES "GamePiece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveHistory" ADD CONSTRAINT "MoveHistory_capturedPieceId_fkey" FOREIGN KEY ("capturedPieceId") REFERENCES "GamePiece"("id") ON DELETE SET NULL ON UPDATE CASCADE;
