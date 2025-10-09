/*
  Warnings:

  - Added the required column `speciesId` to the `animal_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speciesId` to the `phases` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add speciesId columns as nullable first
ALTER TABLE "public"."animal_types" ADD COLUMN "speciesId" TEXT;
ALTER TABLE "public"."phases" ADD COLUMN "speciesId" TEXT;

-- Step 2: Populate speciesId for existing animal_types by joining through subspecies
UPDATE "public"."animal_types" 
SET "speciesId" = s."speciesId"
FROM "public"."subspecies" s
WHERE "animal_types"."subspeciesId" = s."id";

-- Step 3: Populate speciesId for existing phases by joining through animal_types and subspecies
UPDATE "public"."phases" 
SET "speciesId" = s."speciesId"
FROM "public"."animal_types" at
JOIN "public"."subspecies" s ON at."subspeciesId" = s."id"
WHERE "phases"."animalTypeId" = at."id";

-- Step 4: Make speciesId columns NOT NULL
ALTER TABLE "public"."animal_types" ALTER COLUMN "speciesId" SET NOT NULL;
ALTER TABLE "public"."phases" ALTER COLUMN "speciesId" SET NOT NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE "public"."animal_types" ADD CONSTRAINT "animal_types_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."species"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."phases" ADD CONSTRAINT "phases_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."species"("id") ON DELETE CASCADE ON UPDATE CASCADE;
