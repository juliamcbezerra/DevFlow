-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "projectImage" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePic" TEXT;
