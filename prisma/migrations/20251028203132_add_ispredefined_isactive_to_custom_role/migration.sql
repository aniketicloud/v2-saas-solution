-- AlterTable
ALTER TABLE "customRole" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPredefined" BOOLEAN NOT NULL DEFAULT false;
