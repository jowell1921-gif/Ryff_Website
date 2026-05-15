-- CreateEnum
CREATE TYPE "BandRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "bands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "genres" TEXT[],
    "location" TEXT,
    "avatar" TEXT,
    "banner" TEXT,
    "lookingFor" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band_members" (
    "id" TEXT NOT NULL,
    "role" "BandRole" NOT NULL DEFAULT 'MEMBER',
    "instrument" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,

    CONSTRAINT "band_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "band_members_userId_bandId_key" ON "band_members"("userId", "bandId");

-- AddForeignKey
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
