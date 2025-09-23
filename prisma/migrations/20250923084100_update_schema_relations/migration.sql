/*
  Warnings:

  - You are about to drop the column `addressId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dossiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `dossierId` on table `Loan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_addressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_dossierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Loan" DROP CONSTRAINT "Loan_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Loan" DROP CONSTRAINT "Loan_dossierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Series" DROP CONSTRAINT "Series_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "addressId",
DROP COLUMN "seriesId",
ADD COLUMN     "liasseId" INTEGER,
ADD COLUMN     "typeId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Loan" DROP COLUMN "documentId",
ALTER COLUMN "dossierId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Options" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Structure" ADD COLUMN     "niveau" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "parentId" INTEGER;

-- DropTable
DROP TABLE "public"."Address";

-- DropTable
DROP TABLE "public"."Dossiers";

-- DropTable
DROP TABLE "public"."Series";

-- CreateTable
CREATE TABLE "public"."Serie" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "level" INTEGER NOT NULL DEFAULT 1,
    "dcl" INTEGER NOT NULL DEFAULT 10,
    "dua" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Serie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Liasse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serieId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Liasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Localisation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TypeDocument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."DossiersStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dossier" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "infoCompl" TEXT,
    "commentaire" TEXT,
    "code" TEXT NOT NULL,
    "status" "public"."DossiersStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL,
    "typeId" INTEGER,
    "structureId" INTEGER,
    "serieId" INTEGER,
    "localisationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TypeDossier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "status" "public"."DossiersStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeDossier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Serie_code_key" ON "public"."Serie"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Localisation_code_key" ON "public"."Localisation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_code_key" ON "public"."Dossier"("code");

-- AddForeignKey
ALTER TABLE "public"."Serie" ADD CONSTRAINT "Serie_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Liasse" ADD CONSTRAINT "Liasse_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "public"."Serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."Dossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."TypeDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_liasseId_fkey" FOREIGN KEY ("liasseId") REFERENCES "public"."Liasse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dossier" ADD CONSTRAINT "Dossier_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."TypeDossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dossier" ADD CONSTRAINT "Dossier_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "public"."Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dossier" ADD CONSTRAINT "Dossier_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "public"."Serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dossier" ADD CONSTRAINT "Dossier_localisationId_fkey" FOREIGN KEY ("localisationId") REFERENCES "public"."Localisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Loan" ADD CONSTRAINT "Loan_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Structure" ADD CONSTRAINT "Structure_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
