-- CreateTable
CREATE TABLE "GameState" (
    "id" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "currentPlayer" TEXT NOT NULL,
    "capturedPieces" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("id")
);
