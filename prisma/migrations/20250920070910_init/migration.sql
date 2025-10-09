-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feed_formulations" (
    "id" TEXT NOT NULL,
    "feedBatchWeight" DOUBLE PRECISION NOT NULL,
    "species" TEXT NOT NULL,
    "subspecies" TEXT,
    "animalType" TEXT,
    "phase" TEXT NOT NULL,
    "crudeProtein" DOUBLE PRECISION,
    "energy" DOUBLE PRECISION,
    "includePremix" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "feed_formulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "crudeProtein" DOUBLE PRECISION,
    "energy" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "maxInclusion" DOUBLE PRECISION,
    "minInclusion" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feed_formulation_ingredients" (
    "id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedFormulationId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "feed_formulation_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."species_configs" (
    "id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "subspecies" TEXT,
    "animalType" TEXT,
    "phase" TEXT NOT NULL,
    "minProtein" DOUBLE PRECISION,
    "maxProtein" DOUBLE PRECISION,
    "minEnergy" DOUBLE PRECISION,
    "maxEnergy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "species_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "public"."ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "species_configs_species_subspecies_animalType_phase_key" ON "public"."species_configs"("species", "subspecies", "animalType", "phase");

-- AddForeignKey
ALTER TABLE "public"."feed_formulations" ADD CONSTRAINT "feed_formulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feed_formulation_ingredients" ADD CONSTRAINT "feed_formulation_ingredients_feedFormulationId_fkey" FOREIGN KEY ("feedFormulationId") REFERENCES "public"."feed_formulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feed_formulation_ingredients" ADD CONSTRAINT "feed_formulation_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
