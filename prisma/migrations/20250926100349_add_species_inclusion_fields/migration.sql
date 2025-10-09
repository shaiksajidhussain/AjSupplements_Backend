-- AlterTable
ALTER TABLE "public"."species" ADD COLUMN     "includeAnimalTypes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "includePhases" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "includeSubspecies" BOOLEAN NOT NULL DEFAULT true;
