/*
  Warnings:

  - The primary key for the `post_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `type` to the `post_likes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('APLAUSO', 'FIRE', 'ASOMBRA');

-- AlterTable
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_pkey",
ADD COLUMN     "type" "ReactionType" NOT NULL,
ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("userId", "postId", "type");
