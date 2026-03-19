-- Create escrow lifecycle enum.
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED');

-- Extend Payment with escrow lifecycle fields.
ALTER TABLE "Payment"
ADD COLUMN "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'HELD',
ADD COLUMN "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "releasedAt" TIMESTAMP(3);

-- Extend Transaction logs with context.
ALTER TABLE "Transaction"
ADD COLUMN "description" TEXT,
ADD COLUMN "balanceAfter" DECIMAL(12,2);

-- Wallet table for user balances.
CREATE TABLE "Wallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "availableBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "heldBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

ALTER TABLE "Wallet"
ADD CONSTRAINT "Wallet_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
