-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REEL_LIKE';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "reelId" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
