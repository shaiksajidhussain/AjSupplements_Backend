-- CreateTable
CREATE TABLE "public"."species" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subspecies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "speciesId" TEXT NOT NULL,

    CONSTRAINT "subspecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."animal_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subspeciesId" TEXT NOT NULL,

    CONSTRAINT "animal_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."phases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minProtein" DOUBLE PRECISION,
    "maxProtein" DOUBLE PRECISION,
    "minEnergy" DOUBLE PRECISION,
    "maxEnergy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animalTypeId" TEXT NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "species_name_key" ON "public"."species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subspecies_speciesId_name_key" ON "public"."subspecies"("speciesId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "animal_types_subspeciesId_name_key" ON "public"."animal_types"("subspeciesId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "phases_animalTypeId_name_key" ON "public"."phases"("animalTypeId", "name");

-- AddForeignKey
ALTER TABLE "public"."subspecies" ADD CONSTRAINT "subspecies_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_types" ADD CONSTRAINT "animal_types_subspeciesId_fkey" FOREIGN KEY ("subspeciesId") REFERENCES "public"."subspecies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."phases" ADD CONSTRAINT "phases_animalTypeId_fkey" FOREIGN KEY ("animalTypeId") REFERENCES "public"."animal_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
