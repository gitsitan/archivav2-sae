/*
  Warnings:

  - You are about to drop the column `description` on the `Localisation` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Localisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Localisation" DROP COLUMN "description",
DROP COLUMN "location",
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Localisation" ADD CONSTRAINT "Localisation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Localisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
