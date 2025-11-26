-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interestTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
