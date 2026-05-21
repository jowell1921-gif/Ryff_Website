/*
  Warnings:

  - The primary key for the `reel_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `type` to the `reel_likes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reel_likes" DROP CONSTRAINT "reel_likes_pkey",
ADD COLUMN     "type" "ReactionType" NOT NULL,
ADD CONSTRAINT "reel_likes_pkey" PRIMARY KEY ("userId", "reelId", "type");
